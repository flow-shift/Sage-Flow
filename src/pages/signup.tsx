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
