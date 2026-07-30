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
import Unauthorized from "@/pages/Unauthorized";
import PageNotFound from "@/lib/PageNotFound";

// Admin Pages
import Dashboard from "@/pages/Dashboard";
import Participants from "@/pages/Participants";
import Internships from "@/pages/Internships";
import Attendance from "@/pages/Attendance";
import AdminAttendanceReview from "@/pages/AdminAttendanceReview";
import AdminFinalReportReview from "@/pages/AdminFinalReportReview";
import Evaluations from "@/pages/Evaluations";
import Status from "@/pages/Status";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

// User Pages
import Profile from "@/pages/Profile";
import MyDashboard from "@/pages/MyDashboard";
import MyAttendance from "@/pages/MyAttendance";
import MyInternship from "@/pages/MyInternship";
import MyEvaluation from "@/pages/MyEvaluation";
import MyStatus from "@/pages/MyStatus";
import MyFinalReport from "@/pages/MyFinalReport";

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

                {/* Attendance */}
                <Route path="/attendance" element={<Attendance />} />
                <Route
                  path="/admin-attendance-review"
                  element={<AdminAttendanceReview />}
                />

                {/* Final Report */}
                <Route
                  path="/admin-final-report-review"
                  element={<AdminFinalReportReview />}
                />

                {/* Evaluation */}
                <Route path="/evaluations" element={<Evaluations />} />

                {/* Status */}
                <Route path="/status" element={<Status />} />

                {/* Reports */}
                <Route path="/reports" element={<Reports />} />

                {/* Settings */}
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
                <Route path="/my-final-report" element={<MyFinalReport />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Redirect */}
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