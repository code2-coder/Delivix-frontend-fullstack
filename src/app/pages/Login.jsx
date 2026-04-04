import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { LogIn, Package } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { success, message } = await login(email, password);
    if (success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error(message || "Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <Link to="/" className="flex items-center justify-center mb-6 drop-shadow-sm group mt-4">
               <div className="bg-emerald-100 p-2 rounded-xl mr-3 group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 border border-emerald-200">
                  <Package className="w-8 h-8 text-emerald-600" />
               </div>
               <span className="bg-gradient-to-r from-emerald-700 to-teal-500 text-transparent bg-clip-text font-black text-3xl tracking-tighter uppercase">
                 Delivix
               </span>
          </Link>
          <h2 className="text-2xl font-semibold">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
          <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
