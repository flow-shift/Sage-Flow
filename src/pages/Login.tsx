import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Eye, EyeOff, BookOpen } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const { login, loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) navigate("/dashboard");
    else setError(result.error || "Login failed.");
  };

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setGoogleLoading(true);
    const result = await loginWithGoogle();
    setGoogleLoading(false);
    if (result.success) navigate("/dashboard");
    else setGoogleError(result.error || "Google sign in failed.");
  };

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
            <h2 className="text-2xl font-bold text-gray-800">Login</h2>
            <p className="text-gray-500 text-sm mt-1">Welcome back! Please enter your details.</p>
          </div>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
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
            {googleLoading ? "Connecting..." : "Login with Google"}
          </button>

          {googleError && <p className="text-sm text-red-600 text-center">{googleError}</p>}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 border-2 border-gray-200 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-emerald-50/30"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-gray-800 placeholder-gray-400 border-2 border-gray-200 outline-none transition-all duration-200 focus:border-emerald-500 focus:bg-emerald-50/30"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60 shadow-md shadow-emerald-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : "Login"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
