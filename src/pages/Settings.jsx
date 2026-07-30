import { useAuth } from "@/context/AuthContext";
import { Settings as SettingsIcon, Shield, User } from "lucide-react";

export default function Settings() {
  const { userProfile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">App configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neo-purple rounded-lg border-[3px] border-black dark:border-white flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Account</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 rounded-lg bg-neo-gray dark:bg-neutral-800">
              <span className="text-muted-foreground">Name</span>
              <span className="font-bold">{userProfile?.name}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-neo-gray dark:bg-neutral-800">
              <span className="text-muted-foreground">Email</span>
              <span className="font-bold truncate ml-2">{userProfile?.email}</span>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-neo-gray dark:bg-neutral-800">
              <span className="text-muted-foreground">Role</span>
              <span className="neo-badge bg-neo-yellow">{userProfile?.role?.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neo-blue rounded-lg border-[3px] border-black dark:border-white flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Firebase Config</h3>
          </div>
          <div className="text-sm space-y-2">
            <p className="text-muted-foreground">
              Firebase credentials are loaded from environment variables:
            </p>
            <pre className="text-xs bg-black text-white p-3 rounded-lg overflow-x-auto">
{`VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=***
VITE_FIREBASE_PROJECT_ID=***
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***`}
            </pre>
            <p className="text-xs text-muted-foreground mt-2">
              Set these in your .env file at the project root.
            </p>
          </div>
        </div>

        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neo-green rounded-lg border-[3px] border-black dark:border-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Admin Setup</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Users with email <code className="bg-black text-white px-1 rounded">admin@gmail.com</code> are
            automatically assigned the <span className="font-bold">admin</span> role. All other users
            get the <span className="font-bold">user</span> (mahasiswa) role.
          </p>
        </div>

        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-neo-pink rounded-lg border-[3px] border-black dark:border-white flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg">Firestore Collections</h3>
          </div>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• <span className="font-bold text-foreground">users</span> - User accounts</li>
            <li>• <span className="font-bold text-foreground">participants</span> - Mahasiswa data</li>
            <li>• <span className="font-bold text-foreground">internships</span> - Internship placements</li>
            <li>• <span className="font-bold text-foreground">attendance</span> - Attendance records</li>
            <li>• <span className="font-bold text-foreground">evaluations</span> - Mentor evaluations</li>
            <li>• <span className="font-bold text-foreground">internship_status</span> - Status tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}