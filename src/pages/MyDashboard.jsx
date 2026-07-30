import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  participantsService,
  internshipsService,
  attendanceService,
  evaluationsService,
  internshipStatusService,
  calculateEvaluationScore,
} from "@/services/firestoreService";
import StatCard from "@/components/StatCard";
import {
  CalendarCheck,
  Star,
  Activity,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function MyDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      try {
        const [allParticipants, allInternships, allAttendance, allEvals, allStatuses] =
          await Promise.all([
            participantsService.getAll(),
            internshipsService.getAll(),
            attendanceService.getAll(),
            evaluationsService.getAll(),
            internshipStatusService.getAll(),
          ]);
        const me = allParticipants.find((p) => p.email === user.email);
        if (me) {
          setData({
            participant: me,
            internship: allInternships.find((i) => i.participantId === me.id),
            attendance: allAttendance.filter((a) => a.participantId === me.id),
            evaluations: allEvals.filter((e) => e.participantId === me.id),
            status: allStatuses.filter((s) => s.participantId === me.id),
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.email]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const hadir = data?.attendance.filter((a) => a.status === "Hadir").length || 0;
  const izin = data?.attendance.filter((a) => a.status === "Izin").length || 0;
  const alpha = data?.attendance.filter((a) => a.status === "Alpha").length || 0;
  const avgScore = data?.evaluations.length
    ? Math.round(
        data.evaluations.reduce((sum, e) => sum + (e.nilaiAkhir ?? calculateEvaluationScore(e)), 0) /
          data.evaluations.length
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {data?.participant?.namaLengkap || "Student"}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Attendance" value={hadir} icon={CalendarCheck} color="neo-green" />
        <StatCard label="Izin Count" value={izin} icon={Clock} color="neo-yellow" />
        <StatCard label="Alpha Count" value={alpha} icon={XCircle} color="neo-pink" />
        <StatCard label="Avg Score" value={avgScore} icon={Star} color="neo-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Current Status
          </h3>
          {data?.status?.length > 0 ? (
            data.status.map((s) => (
              <div key={s.id} className="space-y-3">
                <span className="neo-badge bg-neo-blue">{s.status}</span>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Progress</span>
                    <span>{s.progress || 0}%</span>
                  </div>
                  <div className="w-full h-4 bg-neo-gray dark:bg-neutral-800 rounded-full border-[2px] border-black dark:border-white overflow-hidden">
                    <div className="h-full bg-neo-green" style={{ width: `${s.progress || 0}%` }} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No status available.</p>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Latest Evaluation
          </h3>
          {data?.evaluations?.length > 0 ? (
            data.evaluations.map((ev) => {
              const score = ev.nilaiAkhir ?? calculateEvaluationScore(ev);
              return (
                <div key={ev.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Score</span>
                    <span className="neo-badge bg-neo-green">{score}/100</span>
                  </div>
                  {ev.catatanMentor && (
                    <p className="text-xs text-muted-foreground">{ev.catatanMentor}</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No evaluations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}