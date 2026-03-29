import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/signup";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyDevice from "./pages/VerifyDevice";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import DashboardLayout from "./layouts/DashboardLayout";
import Overview from "./pages/Overview";
import Tasks from "./pages/Tasks";
import Analytics from "./pages/Analytics";
import StudyPlanner from "./pages/Studyplanner";
import TestGenerator from "./pages/TestGenerator";
import Pomodoro from "./pages/Pomodoro";
import Flashcards from "./pages/Flashcards";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-device" element={<VerifyDevice />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="study-planner" element={<StudyPlanner />} />
              <Route path="test-generator" element={<TestGenerator />} />
              <Route path="pomodoro" element={<Pomodoro />} />
              <Route path="flashcards" element={<Flashcards />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
    