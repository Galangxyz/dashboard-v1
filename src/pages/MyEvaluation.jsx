import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { participantsService, evaluationsService, calculateEvaluationScore } from "@/services/firestoreService";
import { Loader2, Star, Award } from "lucide-react";

export default function MyEvaluation() {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      try {
        const all = await participantsService.getAll();
        const me = all.find((p) => p.email === user.email);
        if (me) {
          const evals = await evaluationsService.getAll();
          setEvaluations(evals.filter((e) => e.participantId === me.id));
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

  const scoreColor = (score) => {
    if (score >= 80) return "bg-neo-green";
    if (score >= 60) return "bg-neo-yellow";
    if (score >= 40) return "bg-neo-blue";
    return "bg-neo-pink";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nilai Saya</h1>
        <p className="text-muted-foreground mt-1">Your mentor evaluations</p>
      </div>

      {evaluations.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No evaluations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evaluations.map((ev) => {
            const score = ev.nilaiAkhir ?? calculateEvaluationScore(ev);
            return (
              <div key={ev.id} className="neo-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    <span className="font-bold">Evaluation</span>
                  </div>
                  <span className={`neo-badge ${scoreColor(score)} text-base`}>
                    {score}/100
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {[
                    { key: "disiplin", label: "Disiplin" },
                    { key: "kerjaSama", label: "Kerja Sam" },
                    { key: "komunikasi", label: "Komunikasi" },
                    { key: "tanggungJawab", label: "Tanggung Jawab" },
                    { key: "inisiatif", label: "Inisiatif" },
                  ].map((c) => (
                    <div key={c.key} className="text-center p-2 rounded-lg border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
                      <p className="text-xl font-bold">{ev[c.key] ?? 0}</p>
                      <p className="text-[10px] font-medium text-muted-foreground leading-tight">
                        {c.label}
                      </p>
                    </div>
                  ))}
                </div>
                {ev.catatanMentor && (
                  <div className="border-t-[2px] border-black/20 dark:border-white/20 pt-3">
                    <p className="text-xs font-bold mb-1">Catatan Mentor:</p>
                    <p className="text-sm text-muted-foreground">{ev.catatanMentor}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}