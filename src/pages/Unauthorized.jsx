import { useAuth } from "@/context/AuthContext";
import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  const { role } = useAuth();
  const homePath = role === "admin" ? "/dashboard" : "/my-dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neo-gray p-6">
      <div className="neo-card max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-neo-pink rounded-xl border-[3px] border-black dark:border-white flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Akses Dengan Mancak!</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Anda tidak memiliki permitan untuk melihat halaman ini.
        </p>
        <Link to={homePath} className="neo-btn neo-btn-yellow">
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}