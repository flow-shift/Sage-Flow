import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail as firebaseSendPasswordReset,
  sendEmailVerification,
  fetchSignInMethodsForEmail,
  deleteUser,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signupWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<void>;
  logout: () => void;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

const toUser = (fb: FirebaseUser): User => ({
  id: fb.uid,
  email: fb.email || "",
  name: fb.displayName || fb.email?.split("@")[0] || "User",
});

const saveUserToFirestore = async (fb: FirebaseUser) => {
  const ref = doc(db, "users", fb.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      name: fb.displayName || fb.email?.split("@")[0] || "User",
      email: fb.email,
      createdAt: serverTimestamp(),
    });
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fb) => {
      setUser(fb ? toUser(fb) : null);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length === 0) {
        return { success: false, error: "This email is not registered. Please sign up first." };
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        return { success: false, error: "Please verify your email first. Check your inbox." };
      }
      await saveUserToFirestore(cred.user);
      return { success: true };
    } catch (e: any) {
      const errors: Record<string, string> = {
        "auth/invalid-credential": "Incorrect password. Please try again.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-disabled": "This account has been disabled.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
      };
      return { success: false, error: errors[e.code] || "Login failed. Please try again." };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      await saveUserToFirestore({ ...cred.user, displayName: name });
      await signOut(auth);
      return { success: true };
    } catch (e: any) {
      const errors: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Please login instead.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
      };
      return { success: false, error: errors[e.code] || "Signup failed. Please try again." };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await signOut(auth);
        return { success: false, error: "No account found. Please sign up first." };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const signupWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const ref = doc(db, "users", cred.user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { success: false, error: "Account already exists. Please login instead." };
      }
      await saveUserToFirestore(cred.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const deleteAccount = async () => {
    const fb = auth.currentUser;
    if (!fb) return;
    // Delete Firestore user document
    await deleteDoc(doc(db, "users", fb.uid));
    // Clear all localStorage data
    [
      "tasks", "studySubjects", "studySchedule", "studyHoursPerDay",
      "testScores", "flashcards", "aptitudeScores",
      "pomo_work", "pomo_short", "pomo_long", "pomo_sessions", "pomo_auto",
      "hasSeenOnboarding",
    ].forEach((k) => localStorage.removeItem(k));
    // Delete Firebase Auth account
    await deleteUser(fb);
    setUser(null);
  };

  const logout = () => signOut(auth);

  const sendPasswordReset = async (email: string) => {
    try {
      await firebaseSendPasswordReset(auth, email);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, signupWithGoogle, logout, deleteAccount, sendPasswordReset, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
