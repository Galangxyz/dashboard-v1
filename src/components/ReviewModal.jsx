import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";

export default function ReviewModal({ record, type, onApprove, onReject, onClose, saving }) {
  const [mode, setMode] = useState(null); // "approve" | "reject"
  const [reviewNote, setReviewNote] = useState("");

  const handleSubmit = () => {
    if (mode === "approve") {
      onApprove("");
    } else if (mode === "reject") {
      if (reviewNote.trim().length < 5) {
        alert("Alasan reject wajib diisi minimal 5 karakter.");
        return;
      }
      onReject(reviewNote.trim());
    }
  };

  if (!record) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="neo-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h3 className="text-xl font-bold mb-4">
          {type === "attendance" ? "Review Kehadiran" : "Review Laporan Akhir"}
        </h3>

        {type === "attendance" ? (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border-[2px] border-black bg-neo-purple flex items-center justify-center font-bold">
                {record.nama?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold">{record.nama}</p>
                <p className="text-xs text-muted-foreground">
                  {record.tanggal} {record.jamMasuk && `• ${record.jamMasuk}`}
                </p>
              </div>
            </div>
            {record.fotoKegiatan && (
              <img
                src={record.fotoKegiatan}
                alt="Foto Kegiatan"
                className="w-full h-48 object-cover rounded-xl border-[2px] border-black"
              />
            )}
            <div className="p-3 rounded-xl border-[2px] border-black bg-neo-gray dark:bg-neutral-800 text-sm">
              <p className="font-bold mb-1">Aktivitas:</p>
              <p>{record.aktivitas}</p>
            </div>
            <div className="p-3 rounded-xl border-[2px] border-black bg-neo-gray dark:bg-neutral-800 text-sm">
              <p className="font-bold mb-1">Lokasi:</p>
              <p>{record.alamat || "N/A"}</p>
              <p className="text-xs font-mono mt-1">
                {record.latitude}, {record.longitude}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg border-[2px] border-black bg-neo-blue flex items-center justify-center font-bold">
                {record.nama?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-bold">{record.nama}</p>
                <p className="text-xs text-muted-foreground">{record.judul}</p>
              </div>
            </div>
            {record.fotoUrl && (
              <img
                src={record.fotoUrl}
                alt="Foto Dokumentasi"
                className="w-full h-48 object-cover rounded-xl border-[2px] border-black"
              />
            )}
            <div className="p-3 rounded-xl border-[2px] border-black bg-neo-gray dark:bg-neutral-800 text-sm">
              <p className="font-bold mb-1">Deskripsi:</p>
              <p>{record.deskripsi}</p>
            </div>
            {record.pdfUrl && (
              <a
                href={record.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-blue w-full"
              >
                <FileText className="w-4 h-4" />
                Lihat PDF Laporan
              </a>
            )}
          </div>
        )}

        {!mode ? (
          <div className="flex gap-3">
            <button
              onClick={() => setMode("approve")}
              disabled={saving}
              className="neo-btn neo-btn-green flex-1"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => setMode("reject")}
              disabled={saving}
              className="neo-btn neo-btn-pink flex-1"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
            <button onClick={onClose} disabled={saving} className="neo-btn">
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "reject" && (
              <div>
                <label className="neo-label">Alasan Reject (Wajib)</label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="Mengisi alasan reject..."
                  rows={3}
                  className="neo-input resize-none"
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="neo-btn neo-btn-black flex-1"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Confirm {mode === "approve" ? "Approve" : "Reject"}</>
                )}
              </button>
              <button
                onClick={() => {
                  setMode(null);
                  setReviewNote("");
                }}
                disabled={saving}
                className="neo-btn"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}