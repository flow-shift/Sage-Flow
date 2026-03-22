import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Trash2, Save, User, Moon, Sun, Download, Upload } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleExportData = () => {
    const data = {
      tasks: localStorage.getItem('tasks'),
      studySubjects: localStorage.getItem('studySubjects'),
      studySchedule: localStorage.getItem('studySchedule'),
      testScores: localStorage.getItem('testScores'),
      flashcards: localStorage.getItem('flashcards'),
      studyNotes: localStorage.getItem('studyNotes'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sage-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Success', description: 'Data exported successfully' });
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach(key => {
          if (data[key]) localStorage.setItem(key, data[key]);
        });
        toast({ title: 'Success', description: 'Data imported successfully. Refreshing...' });
        setTimeout(() => window.location.reload(), 1000);
      } catch {
        toast({ title: 'Error', description: 'Invalid backup file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Error", description: "Name and email are required", variant: "destructive" });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u: any) => u.email === user?.email);
    if (idx === -1) return;

    // Check if new email is taken by another user
    if (email !== user?.email && users.find((u: any, i: number) => u.email === email && i !== idx)) {
      toast({ title: "Error", description: "Email already in use", variant: "destructive" });
      return;
    }

    users[idx].name = name.trim();
    users[idx].email = email.trim();
    localStorage.setItem("users", JSON.stringify(users));

    const updated = { name: name.trim(), email: email.trim() };
    localStorage.setItem("currentUser", JSON.stringify(updated));

    // Force auth context update by reloading
    window.location.reload();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "New password must be at least 6 characters", variant: "destructive" });
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const idx = users.findIndex((u: any) => u.email === user?.email && u.password === currentPassword);
    if (idx === -1) {
      toast({ title: "Error", description: "Current password is incorrect", variant: "destructive" });
      return;
    }

    users[idx].password = newPassword;
    localStorage.setItem("users", JSON.stringify(users));
    setCurrentPassword("");
    setNewPassword("");
    toast({ title: "Success", description: "Password updated successfully" });
  };

  const handleDeleteAccount = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const filtered = users.filter((u: any) => u.email !== user?.email);
    localStorage.setItem("users", JSON.stringify(filtered));

    // Clear all user data
    localStorage.removeItem("currentUser");
    localStorage.removeItem("tasks");
    localStorage.removeItem("studySubjects");
    localStorage.removeItem("studySchedule");
    localStorage.removeItem("studyHoursPerDay");
    localStorage.removeItem("testScores");
    localStorage.removeItem("flashcards");
    localStorage.removeItem("studyNotes");
    localStorage.removeItem("pomo_work");
    localStorage.removeItem("pomo_short");
    localStorage.removeItem("pomo_long");
    localStorage.removeItem("pomo_sessions");
    localStorage.removeItem("pomo_auto");

    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and account.</p>
      </div>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="w-5 h-5" /> Edit Profile
          </CardTitle>
          <CardDescription>Update your name and email address</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />} Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Enable dark theme</p>
            </div>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="w-5 h-5" /> Data Management
          </CardTitle>
          <CardDescription>Export or import your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExportData} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" /> Export All Data
          </Button>
          <div>
            <Input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
              id="import-file"
            />
            <Label htmlFor="import-file">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" /> Import Data
                </span>
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <SettingsIcon className="w-5 h-5" /> Change Password
          </CardTitle>
          <CardDescription>Reset your password via email</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/forgot-password')} className="w-full">
            Send Password Reset Link
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <Trash2 className="w-5 h-5" /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Account Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all tasks, study plans, test scores, flashcards, and notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Yes, delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
