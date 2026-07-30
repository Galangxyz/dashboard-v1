import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { finalReportsService } from "@/services/firestoreService";
import { uploadToCloudinary, CLOUDINARY_FOLDERS } from "@/utils/cloudinary";
import {
  Loader2,
  FileText,
  Camera,
  CheckCircle2,
  Upload,
} from "lucide-react";

export default function MyFinalReport() {
  const { user, userProfile } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const load = async () => {
    if (!user?.uid) return;
    try {
      const all = await finalReportsService.getByField("userId", user.uid);
      setReports(all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.uid]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Foto tidak boleh melebi 5MB.");
      return;
    }
    setFotoFile(file);
    setFotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("File harus format PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("PDF tidak boleh melebi 10MB.");
      return;
    }
    setPdfFile(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!judul.trim()) {
      setError("Judul laporan wajib diisi.");
      return;
    }
    if (deskripsi.trim().length < 50) {
      setError("Deskripsi minimal 50 karakter.");
      return;
    }
    if (!pdfFile) {
      setError("PDF laporan wajib upload.");
      return;
    }
    if (!fotoFile) {
      setError("Foto dokumentasi wajib upload.");
      return;
    }

    setSaving(true);
    try {
      // Upload PDF to Cloudinary
      const pdfUrl = await uploadToCloudinary(pdfFile, CLOUDINARY_FOLDERS.REPORTS);

      // Upload Foto to Cloudinary
      const fotoUrl = await uploadToCloudinary(fotoFile, CLOUDINARY_FOLDERS.REPORT_IMAGES);

      await finalReportsService.create({
        userId: user.uid,
        nama: userProfile?.name || user.displayName || "",
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        pdfUrl,
        fotoUrl,
        status: "pending",
        reviewNote: "",
      });

      setJudul("");
      setDeskripsi("");
      setPdfFile(null);
      setFotoFile(null);
      setFotoPreview(null);
      setSuccess("Laporan berhasil mendai. Status: Pending Review.");
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengirim laporan.");
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
      default:
        return "Pending Review";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan Akhir Magang</h1>
        <p className="text-muted-foreground mt-1">
          Submit laporan akhir magang dengan PDF dan foto dokumentasi
        </p>
      </div>

      {success && (
        <div className="neo-card p-4 bg-neo-green/20 border-[3px] border-black flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="neo-card p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Laporan Akhir
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="neo-label">Judul Laporan</label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul laporan akhir magang..."
              className="neo-input"
            />
          </div>

          <div>
            <label className="neo-label">Deskripsi Kegiatan (min 50 karakter)</label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Mengisi deskripsi lengkap kegiatan magang..."
              rows={5}
              className="neo-input resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {deskripsi.length} / 50 karakter minimum
            </p>
          </div>

          <div>
            <label className="neo-label flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Upload PDF Laporan (Wajib, max 10MB)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="hidden"
              id="pdf-input"
            />
            <label htmlFor="pdf-input" className="neo-btn neo-btn-blue cursor-pointer w-full sm:w-auto">
              <Upload className="w-4 h-4" />
              {pdfFile ? "Mengubah PDF" : "Upload PDF"}
            </label>
            {pdfFile && (
              <p className="text-xs text-muted-foreground mt-1">{pdfFile.name}</p>
            )}
          </div>

          <div>
            <label className="neo-label flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Upload Foto Dokumentasi (Wajib, max 5MB)
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFotoChange}
              className="hidden"
              id="foto-input"
            />
            <label htmlFor="foto-input" className="neo-btn neo-btn-blue cursor-pointer w-full sm:w-auto">
              <Camera className="w-4 h-4" />
              {fotoFile ? "Mengubah Foto" : "Upload Foto"}
            </label>
            {fotoPreview && (
              <div className="mt-3">
                <img
                  src={fotoPreview}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-xl border-[2px] border-black"
                />
              </div>
            )}
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
                Mengirim Laporan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Laporan
              </>
            )}
          </button>
        </form>
      </div>

      {/* My Reports */}
      <div className="neo-card p-6">
        <h3 className="font-bold text-lg mb-4">Laporan Saya</h3>
        {reports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No laporan yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden border-[2px] border-black flex-shrink-0">
                  {r.fotoUrl ? (
                    <img src={r.fotoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.judul}</p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{r.deskripsi}</p>
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