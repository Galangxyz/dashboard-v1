import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, role, loading, isFirebaseConfigured } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neo-gray">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neo-gray p-6">
        <div className="neo-card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Firebase Not Configured</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Please set up your Firebase credentials in the <code className="bg-black text-white px-1 rounded">.env</code> file with the following variables:
          </p>
          <pre className="text-xs text-left bg-black text-white p-4 rounded-xl overflow-x-auto">
{`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=`}
          </pre>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}