import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { attendanceService } from "@/services/firestoreService";
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "@/utils/cloudinary";
import LocationPicker from "@/components/LocationPicker";
import {
  Loader2,
  CalendarCheck,
  CheckCircle2,
  Camera,
  MapPin,
  FileText,
  Info,
} from "lucide-react";

export default function MyAttendance() {
  const { user, userProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [aktivitas, setAktivitas] = useState("");
  const [location, setLocation] = useState(null);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!user?.uid) return;
    try {
      const all = await attendanceService.getByField("userId", user.uid);
      const sorted = all.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );
      setRecords(sorted);

      const today = new Date().toISOString().split("T")[0];
      const checkedInToday = all.find((r) => r.tanggal === today);
      setAlreadyCheckedIn(!!checkedInToday);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Foto tidak boleh melebi 5MB.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!photoFile) {
      setError("Foto kegiatan wajib upload.");
      return;
    }
    if (!location) {
      setError("Lokasi GPS wajib tersedia. Klik 'Ambil Lokasi GPS'.");
      return;
    }
    if (aktivitas.trim().length < 20) {
      setError("Aktivitas minimal 20 karakter.");
      return;
    }
    if (alreadyCheckedIn) {
      setError("Anda sudah melakukan absensi hari ini. Silakan kembali besok.");
      return;
    }

    setSaving(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const timeNow = new Date().toTimeString().slice(0, 5);

      // Upload photo to Cloudinary
      const fotoUrl = await uploadToCloudinary(photoFile, CLOUDINARY_FOLDERS.ATTENDANCE);

      await attendanceService.create({
        userId: user.uid,
        nama: userProfile?.name || user.displayName || "",
        fotoKegiatan: fotoUrl,
        aktivitas: aktivitas.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        alamat: location.alamat,
        tanggal: today,
        jamMasuk: timeNow,
        status: "pending",
        reviewNote: "",
      });

      setPhotoFile(null);
      setPhotoPreview(null);
      setAktivitas("");
      setLocation(null);
      setAlreadyCheckedIn(true);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengirim absensi.");
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
      case "approved":
        return "bg-neo-green";
      case "rejected":
        return "bg-neo-pink";
      case "pending":
      default:
        return "bg-neo-yellow";
    }
  };

  const statusLabel = (s) => {
    switch (s) {
      case "approved":
        return "Disetujui";
      case "rejected":
        return "Ditolak";
      case "pending":
      default:
        return "Pending Review";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kehadiran Saya</h1>
        <p className="text-muted-foreground mt-1">
          Absensi harian dengan foto, lokasi GPS, dan aktivitas
        </p>
      </div>

      {alreadyCheckedIn ? (
        <div className="neo-card p-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full border-[3px] border-black bg-neo-green flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Absensi Hari Ini Sependarikan</h3>
          <p className="text-sm text-muted-foreground">
            Anda sudah melakukan absensi hari ini. Silakan kembali besok.
          </p>
        </div>
      ) : (
        <div className="neo-card p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            Check-in Hari Ini
          </h3>

          <div className="mb-4 p-3 rounded-xl border-[2px] border-black bg-neo-blue/20 text-sm flex items-start gap-2">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Anda mengabsen untuk{" "}
              <strong>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>.
              Absensi tidak dapat diedit atau ditemukan setelah mendai.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo Upload */}
            <div>
              <label className="neo-label flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Foto Kegiatan Magang (Wajib)
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-input"
              />
              <label htmlFor="photo-input" className="neo-btn neo-btn-blue cursor-pointer w-full sm:w-auto">
                <Camera className="w-4 h-4" />
                {photoFile ? "Mengubah Foto" : "Upload Foto Kegiatan"}
              </label>
              {photoPreview && (
                <div className="mt-3">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full max-w-xs h-48 object-cover rounded-xl border-[2px] border-black"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{photoFile?.name}</p>
                </div>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="neo-label flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Lokasi GPS (Wajib)
              </label>
              <LocationPicker onLocationChange={setLocation} disabled={saving} />
            </div>

            {/* Activity */}
            <div>
              <label className="neo-label flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Aktivitas Harian (Wajib, min 20 karakter)
              </label>
              <textarea
                value={aktivitas}
                onChange={(e) => setAktivitas(e.target.value)}
                placeholder="Mengisi aktivitas yang dilakukan hari ini..."
                rows={4}
                className="neo-input resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {aktivitas.length} / 20 karakter minimum
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-xl border-[2px] border-black bg-neo-pink/30 text-sm font-medium">
                {error}
              </div>
            )}

            <button type="submit" disabled={saving} className="neo-btn neo-btn-green w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim Absensi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Absensi
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* History */}
      <div className="neo-card p-6">
        <h3 className="font-bold text-lg mb-4">Storia Absensi</h3>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No absensi records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border-[2px] border-black flex-shrink-0">
                  {r.fotoKegiatan ? (
                    <img src={r.fotoKegiatan} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.tanggal}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.jamMasuk} • {r.alamat?.slice(0, 40) || "N/A"}
                  </p>
                  <p className="text-xs mt-1 truncate">{r.aktivitas}</p>
                  {r.reviewNote && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Catatan: {r.reviewNote}
                    </p>
                  )}
                </div>
                <span className={`neo-badge ${statusColor(r.status)} flex-shrink-0`}>
                  {statusLabel(r.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}