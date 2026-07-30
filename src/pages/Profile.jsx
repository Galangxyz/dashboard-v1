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
import { Loader2, User, Mail, Phone, GraduationCap } from "lucide-react";

export default function Profile() {
  const { user, userProfile } = useAuth();
  const [participant, setParticipant] = useState(null);
  const [internship, setInternship] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [attendance, setAttendance] = useState([]);
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

        const myParticipant = allParticipants.find((p) => p.email === user.email);
        setParticipant(myParticipant || null);

        if (myParticipant) {
          setInternship(
            allInternships.find((i) => i.participantId === myParticipant.id) || null
          );
          setAttendance(allAttendance.filter((a) => a.participantId === myParticipant.id));
          setEvaluations(allEvals.filter((e) => e.participantId === myParticipant.id));
          setStatuses(allStatuses.filter((s) => s.participantId === myParticipant.id));
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
        <h1 className="text-3xl font-bold tracking-tight">Profil</h1>
        <p className="text-muted-foreground mt-1">Your profile and internship data</p>
      </div>

      {/* Profile Card */}
      <div className="neo-card p-6">
        <div className="flex items-center gap-4 mb-6">
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="avatar"
              className="w-20 h-20 rounded-xl border-[3px] border-black dark:border-white object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl border-[3px] border-black dark:border-white bg-neo-yellow flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{userProfile?.name}</h2>
            <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
            <span className="neo-badge bg-neo-purple mt-2 inline-block">
              {userProfile?.role?.toUpperCase()}
            </span>
          </div>
        </div>

        {participant && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t-[3px] border-black dark:border-white pt-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">NIM</p>
                <p className="font-bold">{participant.nim}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Email</p>
                <p className="font-bold truncate">{participant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">Phone</p>
                <p className="font-bold">{participant.nomorHp || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Program Studi</p>
              <p className="font-bold">{participant.programStudi}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Angkatan</p>
              <p className="font-bold">{participant.angkatan || "-"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Internship Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Tempat Magang Saya</h3>
          {internship ? (
            <div className="space-y-2 text-sm">
              <p><span className="font-bold">Company:</span> {internship.namaPerusahaan}</p>
              <p><span className="font-bold">Address:</span> {internship.alamat}</p>
              <p><span className="font-bold">Mentor:</span> {internship.mentor}</p>
              <p className="text-muted-foreground">
                {internship.tanggalMulai} → {internship.tanggalSelesai}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No internship assigned yet.</p>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Nilai Mentor Saya</h3>
          {evaluations.length > 0 ? (
            <div className="space-y-3">
              {evaluations.map((ev) => {
                const score = ev.nilaiAkhir ?? calculateEvaluationScore(ev);
                return (
                  <div key={ev.id} className="p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">Score</span>
                      <span className="neo-badge bg-neo-green">{score}/100</span>
                    </div>
                    {ev.catatanMentor && (
                      <p className="text-xs text-muted-foreground mt-2">{ev.catatanMentor}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No evaluations yet.</p>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Status Magang Saya</h3>
          {statuses.length > 0 ? (
            statuses.map((s) => (
              <div key={s.id} className="space-y-2">
                <span className="neo-badge bg-neo-blue">{s.status}</span>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Progress</span>
                    <span>{s.progress || 0}%</span>
                  </div>
                  <div className="w-full h-4 bg-neo-gray dark:bg-neutral-800 rounded-full border-[2px] border-black dark:border-white overflow-hidden">
                    <div
                      className="h-full bg-neo-green"
                      style={{ width: `${s.progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No status yet.</p>
          )}
        </div>

        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4">Kehadiran Saya</h3>
          {attendance.length > 0 ? (
            <div className="space-y-2">
              {attendance.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center p-2 rounded-lg border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800"
                >
                  <span className="text-sm font-medium">{a.tanggal}</span>
                  <span className="neo-badge bg-neo-green text-xs">{a.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendance records.</p>
          )}
        </div>
      </div>
    </div>
  );
}