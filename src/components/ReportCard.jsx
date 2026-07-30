import { CheckCircle2, XCircle, Clock, FileText, ImageIcon } from "lucide-react";

const statusConfig = {
  pending: { label: "Pending", color: "bg-neo-yellow", icon: Clock },
  approved: { label: "Approved", color: "bg-neo-green", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-neo-pink", icon: XCircle },
};

export default function ReportCard({ record, onReview }) {
  const cfg = statusConfig[record.status] || statusConfig.pending;

  return (
    <div className="neo-card overflow-hidden">
      <div className="grid sm:grid-cols-[200px_1fr] gap-0">
        {/* Photo */}
        <div className="h-48 sm:h-full bg-neo-gray dark:bg-neutral-800 border-b-[3px] sm:border-b-0 sm:border-r-[3px] border-black dark:border-white">
          {record.fotoUrl ? (
            <img
              src={record.fotoUrl}
              alt="Foto Dokumentasi"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-lg">{record.nama}</h3>
              <p className="text-sm font-medium">{record.judul}</p>
            </div>
            <span className={`neo-badge ${cfg.color}`}>
              <cfg.icon className="w-3 h-3" />
              {cfg.label}
            </span>
          </div>

          <div className="p-3 rounded-xl border-[2px] border-black dark:border-white bg-neo-gray dark:bg-neutral-800">
            <p className="text-xs font-bold mb-1">Deskripsi</p>
            <p className="text-sm">{record.deskripsi}</p>
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

          {record.reviewNote && (
            <div className="p-2 rounded-lg border-[2px] border-black dark:border-white bg-neo-yellow/30 text-sm">
              <p className="font-bold text-xs">Catatan Admin:</p>
              <p className="text-xs">{record.reviewNote}</p>
            </div>
          )}

          {record.status === "pending" && onReview && (
            <button onClick={() => onReview(record)} className="neo-btn neo-btn-yellow w-full">
              Review Laporan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}