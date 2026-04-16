import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, BookOpen, Sparkles } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate("/dashboard");
    else toast({ title: "Login failed", description: result.error, variant: "destructive" });
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) navigate("/dashboard");
    else toast({ title: "Google sign in failed", description: result.error, variant: "destructive" });
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 40%, #0a1628 100%)" }}>

      {/* animated blobs */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full blur-[120px] opacity-25 animate-pulse"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[100px] opacity-15"
        style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }} />

      {/* left panel — visible on large screens */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: "'Sora', sans-serif" }}>Sage Flow</span>
        </div>

        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Sparkles className="w-3 h-3" /> Smart Study Platform
          </div>
          <h1 className="text-5xl font-extrabold text-white leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            Study smarter,<br />
            <span style={{ background: "linear-gradient(135deg, #10b981, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              not harder
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage tasks, plan your study schedule, generate tests, and track your progress — all in one place.
          </p>
          <div className="flex gap-8 pt-4">
            {[["10K+", "Students"], ["50K+", "Tasks Done"], ["99%", "Satisfaction"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>{val}</p>
                <p className="text-slate-500 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">© 2024 Sage Flow. All rights reserved.</p>
      </div>

      {/* right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px] space-y-6">

          {/* mobile logo */}
          <div className="lg:hidden text-center mb-2">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Sora', sans-serif" }}>Sage Flow</span>
            </div>
          </div>

          {/* card */}
          <div className="rounded-2xl p-8 space-y-5"
            style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>

            <div className="space-y-1">
              <h2 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Login</h2>
              <p className="text-slate-400 text-sm">Welcome back! Continue your learning journey.</p>
            </div>

            {/* Google */}
            <button onClick={handleGoogleLogin} disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "rgba(255,255,255,0.92)", color: "#111827", boxShadow: "0 4px 15px rgba(0,0,0,0.2)" }}>
              {googleLoading
                ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                : <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
              }
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-xs text-slate-600 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => { e.currentTarget.style.border = "1px solid #10b981"; e.currentTarget.style.background = "rgba(16,185,129,0.05)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium transition-colors"
                    style={{ color: "#10b981" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#34d399")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#10b981")}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                    onFocus={e => { e.currentTarget.style.border = "1px solid #10b981"; e.currentTarget.style.background = "rgba(16,185,129,0.05)"; }}
                    onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", boxShadow: "0 4px 20px rgba(16,185,129,0.35)", fontFamily: "'Sora', sans-serif" }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Logging in...
                    </span>
                  : "Login →"}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-slate-600">
            New to Sage Flow?{" "}
            <Link to="/signup" className="font-semibold transition-colors" style={{ color: "#10b981" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#34d399")}
              onMouseLeave={e => (e.currentTarget.style.color = "#10b981")}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
