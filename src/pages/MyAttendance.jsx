import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { attendanceService, participantsService } from "@/services/firestoreService";
import { Loader2, CalendarCheck, CheckCircle2 } from "lucide-react";

export default function MyAttendance() {
  const { user } = useAuth();
  const [participant, setParticipant] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [today, setToday] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("Hadir");

  const load = async () => {
    if (!user?.email) return;
    try {
      const all = await participantsService.getAll();
      const me = all.find((p) => p.email === user.email);
      if (me) {
        setParticipant(me);
        const att = await attendanceService.getAll();
        setRecords(att.filter((a) => a.participantId === me.id).sort((a, b) => b.tanggal?.localeCompare(a.tanggal)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.email]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!participant) return;
    setSaving(true);
    try {
      const existing = records.find((r) => r.tanggal === today);
      if (existing) {
        await attendanceService.update(existing.id, {
          status,
          jamMasuk: new Date().toTimeString().slice(0, 5),
        });
      } else {
        await attendanceService.create({
          participantId: participant.id,
          tanggal: today,
          jamMasuk: new Date().toTimeString().slice(0, 5),
          jamPulang: "",
          status,
        });
      }
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const statusColor = (s) => {
    switch (s) {
      case "Hadir": return "bg-neo-green";
      case "Izin": return "bg-neo-yellow";
      case "Alpha": return "bg-neo-pink";
      default: return "bg-neo-gray";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kehadiran Saya</h1>
        <p className="text-muted-foreground mt-1">Mark your daily attendance</p>
      </div>

      <div className="neo-card p-6">
        <h3 className="font-bold text-lg mb-4">Check-in Today</h3>
        <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={today}
            onChange={(e) => setToday(e.target.value)}
            className="neo-input w-auto"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="neo-input w-auto"
          >
            <option value="Hadir">Hadir</option>
            <option value="Izin">Izin</option>
          </select>
          <button type="submit" disabled={saving} className="neo-btn neo-btn-green">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Check In</>}
          </button>
        </form>
      </div>

      <div className="neo-card p-6">
        <h3 className="font-bold text-lg mb-4">My Attendance History</h3>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No attendance records yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800"
              >
                <span className="font-medium text-sm">{r.tanggal}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono">{r.jamMasuk || "-"}</span>
                  <span className={`neo-badge ${statusColor(r.status)}`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}