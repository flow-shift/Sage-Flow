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
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        await signOut(auth);
        return { success: false, error: "Please verify your email first. Check your inbox." };
      }
      return { success: true };
    } catch (e: any) {
      const msg = e.code === "auth/invalid-credential" ? "Invalid email or password" : e.message;
      return { success: false, error: msg };
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
      const msg = e.code === "auth/email-already-in-use" ? "Email already in use" : e.message;
      return { success: false, error: msg };
    }
  };

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(cred.user);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
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
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, sendPasswordReset, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
