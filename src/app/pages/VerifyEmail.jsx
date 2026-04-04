import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import api from "../api/axios";

export function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        await api.get(`/verify-email/${token}`);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Verification failed");
      }
    };

    if (token) {
        verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-8">
          <div className="bg-emerald-600 text-white px-3 py-1 rounded-lg font-bold text-2xl inline-block mb-4">
            Delivix
          </div>
        </div>

        {status === "loading" && (
            <div className="flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mb-4" />
                <h2 className="text-2xl font-semibold">Verifying Email...</h2>
                <p className="text-gray-600 mt-2">Please wait while we confirm your account.</p>
            </div>
        )}

        {status === "success" && (
            <div className="flex flex-col items-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Email Verified!</h2>
                <p className="text-gray-600 mt-2 mb-6">Your account has been successfully verified. You can now log in securely.</p>
                <Link to="/login" className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 block font-medium">
                   Go to Login
                </Link>
            </div>
        )}

        {status === "error" && (
            <div className="flex flex-col items-center">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800">Verification Failed</h2>
                <p className="text-gray-600 mt-2 mb-6">{message}</p>
                <Link to="/register" className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 block font-medium">
                   Return to Registration
                </Link>
            </div>
        )}

      </div>
    </div>
  );
}
