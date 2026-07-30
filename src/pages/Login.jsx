import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, AlertCircle, Loader2, LogIn } from "lucide-react";

export default function Login() {
  const { loginWithGoogle, isFirebaseConfigured, user, role } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(role === "admin" ? "/dashboard" : "/my-dashboard");
    }
  }, [user, role, navigate]);

  const handleGoogleLogin = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to sign in with Google");
      setLoading(false);
    }
  }, [loginWithGoogle]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-gray p-4">
      <div className="w-full max-w-md">
        <div className="neo-card p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-neo-yellow rounded-xl border-[3px] border-black dark:border-white flex items-center justify-center mb-4">
              <GraduationCap className="w-9 h-9" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">InternHub</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Dashboard Monitoring Mahasiswa Magang
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="mb-6 p-4 rounded-xl border-[3px] border-black bg-neo-pink">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">Firebase Not Configured</p>
                  <p className="text-xs mt-1">
                    Set up your .env file with Firebase credentials to enable login.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl border-[3px] border-black bg-neo-pink text-sm font-medium">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading || !isFirebaseConfigured}
            className="neo-btn neo-btn-yellow w-full py-3 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Continue with Google
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            admin@gmail.com gets admin role automatically. Other users get student role.
          </p>
        </div>
      </div>
    </div>
  );
}