import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen } from "lucide-react";

const ForgotPassword = () => {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await sendPasswordReset(email);
    setLoading(false);
    setMessage(result.success ? "Reset link sent! Check your email." : result.error || "Error sending reset email");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 mb-4 shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Sage Flow</h1>
          <p className="text-gray-500 text-sm mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Forgot Password</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            {message && (
              <p className={`text-sm font-medium text-center ${message.includes("sent") ? "text-emerald-600" : "text-red-500"}`}>
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60 shadow-md shadow-emerald-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : "Send Reset Link"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{" "}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
