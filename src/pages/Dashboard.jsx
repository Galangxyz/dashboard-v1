import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  CheckCircle2,
  Clock,
  Loader2,
  TrendingUp,
  ClipboardList,
  FileCheck2,
  XCircle,
} from "lucide-react";
import StatCard from "@/components/StatCard";
import {
  participantsService,
  internshipStatusService,
  internshipsService,
  attendanceService,
  finalReportsService,
} from "@/services/firestoreService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#FDE047", "#60A5FA", "#4ADE80", "#FB7185", "#A78BFA"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [internships, setInternships] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finalReports, setFinalReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, s, i, a, fr] = await Promise.all([
          participantsService.getAll(),
          internshipStatusService.getAll(),
          internshipsService.getAll(),
          attendanceService.getAll(),
          finalReportsService.getAll(),
        ]);
        setParticipants(p);
        setStatuses(s);
        setInternships(i);
        setAttendance(a);
        setFinalReports(fr);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalParticipants = participants.length;
  const sedangMagang = statuses.filter((s) => s.status === "Sedang Magang").length;
  const selesaiMagang = statuses.filter((s) => s.status === "Selesai").length;
  const belumMulai = statuses.filter((s) => s.status === "Belum Mulai").length;

  // Attendance stats
  const attPending = attendance.filter((a) => a.status === "pending").length;
  const attApproved = attendance.filter((a) => a.status === "approved").length;
  const attRejected = attendance.filter((a) => a.status === "rejected").length;

  // Final report stats
  const frPending = finalReports.filter((r) => r.status === "pending").length;
  const frApproved = finalReports.filter((r) => r.status === "approved").length;
  const frRejected = finalReports.filter((r) => r.status === "rejected").length;

  // Bar chart: participants per program studi
  const programCounts = participants.reduce((acc, p) => {
    const prog = p.programStudi || "Unknown";
    acc[prog] = (acc[prog] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(programCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // Pie chart: status distribution
  const statusCounts = statuses.reduce((acc, s) => {
    const st = s.status || "Unknown";
    acc[st] = (acc[st] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const recentParticipants = [...participants]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview statistik mahasiswa magang
        </p>
      </div>

      {/* Participant Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Peserta" value={totalParticipants} icon={Users} color="neo-yellow" />
        <StatCard label="Sedang Magang" value={sedangMagang} icon={Activity} color="neo-blue" />
        <StatCard label="Selesai Magang" value={selesaiMagang} icon={CheckCircle2} color="neo-green" />
        <StatCard label="Belum Mulai" value={belumMulai} icon={Clock} color="neo-pink" />
      </div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="neo-card p-5">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Review Kehadiran
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-yellow">
              <p className="text-2xl font-black">{attPending}</p>
              <p className="text-xs font-bold">Pending</p>
            </div>
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-green">
              <p className="text-2xl font-black">{attApproved}</p>
              <p className="text-xs font-bold">Disetujui</p>
            </div>
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-pink">
              <p className="text-2xl font-black">{attRejected}</p>
              <p className="text-xs font-bold">Ditolak</p>
            </div>
          </div>
        </div>

        <div className="neo-card p-5">
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5" />
            Review Laporan Akhir
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-yellow">
              <p className="text-2xl font-black">{frPending}</p>
              <p className="text-xs font-bold">Pending</p>
            </div>
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-green">
              <p className="text-2xl font-black">{frApproved}</p>
              <p className="text-xs font-bold">Disetujui</p>
            </div>
            <div className="text-center p-3 rounded-xl border-[2px] border-black bg-neo-pink">
              <p className="text-2xl font-black">{frRejected}</p>
              <p className="text-xs font-bold">Ditolak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Peserta per Program Studi
          </h3>
          {barData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 12, fontWeight: 600 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    border: "3px solid black",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="count" fill="#FDE047" stroke="#000000" strokeWidth={2} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Status Magang Distribution
          </h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No data available</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#000000"
                  strokeWidth={2}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{
                    border: "3px solid black",
                    borderRadius: "12px",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          {recentParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800"
                >
                  <div className="w-10 h-10 rounded-lg border-[2px] border-black dark:border-white bg-neo-purple flex items-center justify-center font-bold text-sm">
                    {p.namaLengkap?.charAt(0) || "P"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{p.namaLengkap}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.programStudi} • NIM: {p.nim}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">New</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Peserta Terbaru</h3>
          {recentParticipants.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No participants yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-[2px] border-black dark:border-white">
                    <th className="text-left pb-2 font-bold">NIM</th>
                    <th className="text-left pb-2 font-bold">Nama</th>
                    <th className="text-left pb-2 font-bold hidden sm:table-cell">Program</th>
                  </tr>
                </thead>
                <tbody>
                  {recentParticipants.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-black/20 dark:border-white/20 cursor-pointer hover:bg-neo-yellow/20"
                      onClick={() => navigate("/participants")}
                    >
                      <td className="py-2 font-mono text-xs">{p.nim}</td>
                      <td className="py-2 font-medium">{p.namaLengkap}</td>
                      <td className="py-2 hidden sm:table-cell text-muted-foreground">{p.programStudi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}