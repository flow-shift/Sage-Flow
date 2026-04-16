import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Eye, EyeOff } from "lucide-react";

const Signup = () => {
  const { user, signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (user && !done) return <Navigate to="/dashboard" replace />;

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

  const inputStyle = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 40%, #0a1628 100%)" }}>
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      <div className="w-full max-w-md relative z-10 text-center space-y-6">
        <div className="rounded-2xl p-10 space-y-5"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: "rgba(16,185,129,0.15)", border: "2px solid rgba(16,185,129,0.4)" }}>
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#10b981">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Check your inbox</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            We sent a verification link to<br />
            <span className="text-emerald-400 font-semibold">{email}</span><br />
            Click the link to activate your account.
          </p>
          <Link to="/login"
            className="inline-block w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.35)", fontFamily: "'Sora', sans-serif" }}>
            Go to Login →
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 40%, #0a1628 100%)" }}>

      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] rounded-full blur-[120px] opacity-30 animate-pulse"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-150px] right-[-100px] w-[450px] h-[450px] rounded-full blur-[120px] opacity-25 animate-pulse"
        style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }} />

      <div className="w-full max-w-[420px] space-y-6 relative z-10">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-2xl" style={{ fontFamily: "'Sora', sans-serif" }}>Sage Flow</span>
          </div>
        </div>

        <div className="rounded-2xl p-8 space-y-5"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}>

          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Create Account</h2>
            <p className="text-slate-400 text-sm">Join thousands of students studying smarter.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { id: "name", label: "Full Name", type: "text", placeholder: "John Doe", value: name, onChange: setName },
              { id: "email", label: "Email", type: "email", placeholder: "you@example.com", value: email, onChange: setEmail },
            ].map(({ id, label, type, placeholder, value, onChange }) => (
              <div key={id} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.border = "1px solid #10b981"; e.currentTarget.style.background = "rgba(16,185,129,0.05)"; }}
                  onBlur={e => { e.currentTarget.style.border = "1px solid rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-600 outline-none transition-all duration-200"
                  style={inputStyle}
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
                    Creating account...
                  </span>
                : "Create Account →"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold transition-colors" style={{ color: "#10b981" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#34d399")}
            onMouseLeave={e => (e.currentTarget.style.color = "#10b981")}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
