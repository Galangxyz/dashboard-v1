import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  Star,
  Activity,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";

const adminMenu = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Peserta Magang", path: "/participants", icon: Users },
  { label: "Tempat Magang", path: "/internships", icon: Building2 },
  { label: "Kehadiran", path: "/attendance", icon: CalendarCheck },
  { label: "Penilaian Mentor", path: "/evaluations", icon: Star },
  { label: "Status Magang", path: "/status", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
];

const userMenu = [
  { label: "Dashboard", path: "/my-dashboard", icon: LayoutDashboard },
  { label: "Kehadiran Saya", path: "/my-attendance", icon: CalendarCheck },
  { label: "Tempat Magang Saya", path: "/my-internship", icon: Building2 },
  { label: "Nilai Saya", path: "/my-evaluation", icon: Star },
  { label: "Status Magang", path: "/my-status", icon: Activity },
  { label: "Profil", path: "/profile", icon: User },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { role, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const menu = role === "admin" ? adminMenu : userMenu;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-neo-yellow border-r-[3px] border-black z-40 transform transition-transform duration-200 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b-[3px] border-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-neo-yellow" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">InternHub</h1>
              <p className="text-xs font-medium text-black/60">
                {role === "admin" ? "Admin Panel" : "Student Portal"}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {menu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm border-[3px] border-black transition-all ${
                  isActive
                    ? "bg-black text-white shadow-neo-sm"
                    : "bg-white hover:bg-neo-green shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t-[3px] border-black">
          {userProfile && (
            <div className="flex items-center gap-3 mb-3">
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="avatar"
                  className="w-10 h-10 rounded-lg border-[2px] border-black object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg border-[2px] border-black bg-neo-pink flex items-center justify-center font-bold">
                  {userProfile.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{userProfile.name}</p>
                <p className="text-xs truncate">{userProfile.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-bold text-sm border-[3px] border-black rounded-xl bg-neo-pink shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}