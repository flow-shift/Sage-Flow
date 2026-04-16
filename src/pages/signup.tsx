import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const { user, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (user && !done) return <Navigate to="/dashboard" replace />;

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) navigate("/dashboard");
    else toast({ title: "Google sign in failed", description: result.error, variant: "destructive" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const result = await signup(name, email, password);
    setLoading(false);
    if (result.success) setDone(true);
    else toast({ title: "Signup failed", description: result.error, variant: "destructive" });
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Check your inbox</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          We sent a verification link to<br />
          <span className="text-emerald-600 font-semibold">{email}</span><br />
          Click the link to activate your account.
        </p>
        <Link to="/login" className="inline-block w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200">
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sage Flow</h1>
          <p className="text-gray-500 text-sm mt-1">Your smart study companion</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-500 text-sm mt-1">Join thousands of students studying smarter.</p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border-2 border-gray-200 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-emerald-50/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border-2 border-gray-200 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-emerald-50/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 border-2 border-gray-200 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-emerald-50/30"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60 shadow-md shadow-emerald-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
