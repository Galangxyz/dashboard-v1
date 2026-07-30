import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { participantsService, internshipsService } from "@/services/firestoreService";
import { Loader2, Building2, MapPin, User as UserIcon, Calendar } from "lucide-react";

export default function MyInternship() {
  const { user } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.email) return;
      try {
        const all = await participantsService.getAll();
        const me = all.find((p) => p.email === user.email);
        if (me) {
          const internships = await internshipsService.getAll();
          setInternship(internships.find((i) => i.participantId === me.id));
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tempat Magang Saya</h1>
        <p className="text-muted-foreground mt-1">Your internship placement details</p>
      </div>

      {internship ? (
        <div className="neo-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-neo-blue rounded-xl border-[3px] border-black dark:border-white flex items-center justify-center">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{internship.namaPerusahaan}</h2>
              <p className="text-sm text-muted-foreground">Your internship placement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
              <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Alamat</p>
                <p className="font-bold">{internship.alamat}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
              <UserIcon className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Mentor</p>
                <p className="font-bold">{internship.mentor}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
              <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Start Date</p>
                <p className="font-bold">{internship.tanggalMulai}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
              <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">End Date</p>
                <p className="font-bold">{internship.tanggalSelesai}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="neo-card p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No internship assigned yet.</p>
        </div>
      )}
    </div>
  );
}