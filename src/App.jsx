import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import { queryClientInstance } from "@/lib/query-client";
import { AuthProvider } from "@/context/AuthContext";

import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/ScrollToTop";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Participants from "@/pages/Participants";
import Internships from "@/pages/Internships";
import Attendance from "@/pages/Attendance";
import Evaluations from "@/pages/Evaluations";
import Status from "@/pages/Status";
import Settings from "@/pages/Settings";

import Profile from "@/pages/Profile";
import Unauthorized from "@/pages/Unauthorized";

import MyDashboard from "@/pages/MyDashboard";
import MyAttendance from "@/pages/MyAttendance";
import MyInternship from "@/pages/MyInternship";
import MyEvaluation from "@/pages/MyEvaluation";
import MyStatus from "@/pages/MyStatus";

import PageNotFound from "@/lib/PageNotFound";

function App() {
return (
<HelmetProvider>
<AuthProvider>
<QueryClientProvider client={queryClientInstance}>
<Router>
<ScrollToTop />

        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/internships" element={<Internships />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/evaluations" element={<Evaluations />} />
            <Route path="/status" element={<Status />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* User */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/my-dashboard" element={<MyDashboard />} />
            <Route path="/my-attendance" element={<MyAttendance />} />
            <Route path="/my-internship" element={<MyInternship />} />
            <Route path="/my-evaluation" element={<MyEvaluation />} />
            <Route path="/my-status" element={<MyStatus />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>

      <Toaster />
    </QueryClientProvider>
  </AuthProvider>
</HelmetProvider>

);
}

export default App;