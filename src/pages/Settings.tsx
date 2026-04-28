import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Trash2, User, Moon, Sun, Download, Upload, Eye, EyeOff } from "lucide-react";
import { reauthenticateWithCredential, EmailAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const Settings = () => {
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isGoogleUser = auth.currentUser?.providerData?.[0]?.providerId === "google.com";

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const handleExportData = () => {
    const data = {
      tasks: localStorage.getItem("tasks"),
      studySubjects: localStorage.getItem("studySubjects"),
      studySchedule: localStorage.getItem("studySchedule"),
      testScores: localStorage.getItem("testScores"),
      flashcards: localStorage.getItem("flashcards"),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sage-flow-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported successfully" });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach((key) => { if (data[key]) localStorage.setItem(key, data[key]); });
        toast({ title: "Imported successfully" });
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast({ title: "Invalid backup file", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const fb = auth.currentUser;
      if (!fb) return;
      if (isGoogleUser) {
        await reauthenticateWithPopup(fb, googleProvider);
      } else {
        if (!password) {
          toast({ title: "Please enter your password", variant: "destructive" });
          setDeleting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(fb.email!, password);
        await reauthenticateWithCredential(fb, credential);
      }
      await deleteAccount();
      navigate("/login");
    } catch (e: any) {
      if (e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") {
        toast({ title: "Incorrect password", variant: "destructive" });
      } else if (e.code !== "auth/popup-closed-by-user") {
        toast({ title: "Failed to delete account. Please try again.", variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const section = "border rounded-xl p-5 bg-card shadow-sm space-y-4";
  const sectionTitle = "flex items-center gap-2 font-semibold text-base";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account.</p>
      </div>

      <div className={section}>
        <p className={sectionTitle}><User className="w-5 h-5" /> Profile</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Full Name</p>
          <p className="text-sm bg-muted px-3 py-2 rounded-lg">{user?.name}</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm bg-muted px-3 py-2 rounded-lg">{user?.email}</p>
        </div>
      </div>

      <div className={section}>
        <p className={sectionTitle}>
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} Appearance
        </p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark Mode</p>
            <p className="text-xs text-muted-foreground">Enable dark theme</p>
          </div>
          <button
            onClick={() => toggleDarkMode(!darkMode)}
            className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted-foreground/30"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${darkMode ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      <div className={section}>
        <p className={sectionTitle}><Download className="w-5 h-5" /> Data Management</p>
        <button onClick={handleExportData} className="w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> Export All Data
        </button>
        <label htmlFor="import-file" className="w-full flex items-center justify-center gap-2 border rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
          <Upload className="w-4 h-4" /> Import Data
          <input id="import-file" type="file" accept=".json" onChange={handleImportData} className="hidden" />
        </label>
      </div>

      <div className="border border-destructive/30 rounded-xl p-5 bg-card shadow-sm space-y-4">
        <p className="flex items-center gap-2 font-semibold text-base text-destructive">
          <Trash2 className="w-5 h-5" /> Danger Zone
        </p>
        <p className="text-sm text-muted-foreground">Permanently delete your account and all data. This cannot be undone.</p>
        <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 bg-destructive text-destructive-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-destructive/90 transition-colors">
          <Trash2 className="w-4 h-4" /> Delete Account Permanently
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-semibold text-lg">Delete Account</h3>
            <p className="text-sm text-muted-foreground">This will permanently delete your account, all tasks, study plans, test scores, and flashcards. This cannot be undone.</p>
            {isGoogleUser && (
              <p className="text-sm text-blue-600 bg-blue-50 rounded-lg px-3 py-2">You will be asked to verify your Google account to confirm deletion.</p>
            )}
            {!isGoogleUser && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Enter your password to confirm</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 pr-10 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-destructive/50"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowConfirm(false); setPassword(""); }} className="flex-1 border rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} disabled={deleting} className="flex-1 bg-destructive text-destructive-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-destructive/90 transition-colors disabled:opacity-60">
                {deleting ? "Deleting..." : "Yes, delete everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
