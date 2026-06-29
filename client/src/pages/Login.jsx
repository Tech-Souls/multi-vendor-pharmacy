import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from 'react-hot-toast';
import { Mail, Lock, Pill } from 'lucide-react';
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate              = useNavigate();
  const { login }             = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/login", form);

      // Save to context + localStorage
      login(data.user, data.token);

      const role = data.user.role?.toLowerCase();

      if (role === "admin") {
        toast.success("Welcome Admin!");
        setTimeout(() => navigate("/admin"), 500);
      } else if (role === "prescriber") {               // ← NEW
        toast.success(`Welcome, ${data.user.firstName}!`);
        setTimeout(() => navigate("/prescriber"), 500); // ← NEW
      } else {
        toast.success("Logged in successfully!");
        setTimeout(() => navigate("/home"), 500);
      }
    } catch (err) {
      console.error("Login error:", err.response?.data);
      toast.error(err.response?.data?.message || "Check your credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#F4F7F6] font-poppins flex items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="w-full max-w-[1000px] max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">

        {/* LEFT SIDE: Brand Visual */}
        <div className="hidden md:flex md:w-5/12 bg-[#02353C] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-16">
              <div className="bg-teal-400/20 p-2 rounded-lg">
                <Pill size={22} className="text-teal-400" />
              </div>
              <span className="text-lg font-bold tracking-tight">PharmaLogix</span>
            </div>
            <div className="relative">
              <span className="absolute -top-10 -left-4 text-7xl text-teal-400/10 font-serif select-none">"</span>
              <h2 className="text-2xl lg:text-3xl font-bold leading-tight mb-6">
                Ensuring <span className="text-teal-400">Precision</span> <br />
                in Healthcare.
              </h2>
              <div className="space-y-4 border-l-2 border-teal-400/30 pl-6 py-2">
                <p className="text-teal-50/80 text-sm lg:text-base italic leading-relaxed font-light">
                  "The art of healing comes from medicine, but the science of safety comes from the pharmacist."
                </p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        </div>

        {/* RIGHT SIDE: Form */}
        <div className="w-full md:w-7/12 p-8 lg:p-12 flex flex-col justify-center overflow-hidden">
          <div className="max-w-md mx-auto w-full">
            <header className="mb-8">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">Account Login</h1>
              <p className="text-gray-400 text-[13px] font-medium">Welcome back! Please enter your details.</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#02353C] transition-colors h-4 w-4" />
                  <input
                    type="email" required placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:border-[#02353C] outline-none transition-all bg-gray-50/30 font-poppins"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[11px] text-[#02353C] font-bold hover:underline uppercase tracking-tighter">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#02353C] transition-colors h-4 w-4" />
                  <input
                    type="password" required placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3 border border-gray-100 rounded-xl text-sm focus:border-[#02353C] outline-none transition-all bg-gray-50/30 font-poppins"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-teal-800 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-[#034a52] transition-all shadow-md mt-4 font-poppins"
              >
                {loading ? "Verifying..." : "Sign In"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Don't have an account?
                <Link to="/register" className="ml-1.5 text-[#02353C] font-bold hover:underline">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;