import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { participantsService, internshipStatusService } from "@/services/firestoreService";
import { Loader2, Activity } from "lucide-react";

export default function MyStatus() {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      try {
        const all = await participantsService.getAll();
        const me = all.find((p) => p.email === user.email);
        if (me) {
          const st = await internshipStatusService.getAll();
          setStatuses(st.filter((s) => s.participantId === me.id));
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

  const statusColor = (s) => {
    switch (s) {
      case "Sedang Magang": return "bg-neo-blue";
      case "Selesai": return "bg-neo-green";
      case "Belum Mulai": return "bg-neo-yellow";
      case "Dibatalkan": return "bg-neo-pink";
      default: return "bg-neo-gray";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Status Magang Saya</h1>
        <p className="text-muted-foreground mt-1">Your internship status & progress</p>
      </div>

      {statuses.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No status records yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {statuses.map((s) => (
            <div key={s.id} className="neo-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Internship Status</h3>
                <span className={`neo-badge ${statusColor(s.status)} text-sm`}>
                  {s.status}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
                  <p className="text-xs text-muted-foreground font-medium">Start Date</p>
                  <p className="font-bold">{s.tanggalMulai}</p>
                </div>
                <div className="p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
                  <p className="text-xs text-muted-foreground font-medium">End Date</p>
                  <p className="font-bold">{s.tanggalSelesai}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span>Progress</span>
                  <span>{s.progress || 0}%</span>
                </div>
                <div className="w-full h-6 bg-neo-gray dark:bg-neutral-800 rounded-full border-[3px] border-black dark:border-white overflow-hidden">
                  <div
                    className="h-full bg-neo-green transition-all flex items-center justify-end pr-2"
                    style={{ width: `${s.progress || 0}%` }}
                  >
                    {s.progress > 15 && (
                      <span className="text-xs font-bold text-white">{s.progress}%</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}