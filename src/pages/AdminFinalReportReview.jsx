import { useState, useEffect } from "react";
import {
  finalReportsService,
  participantsService,
} from "@/services/firestoreService";
import ReportCard from "@/components/ReportCard";
import ReviewModal from "@/components/ReviewModal";
import { generateFinalReportPDF } from "@/utils/pdfFinalReport";
import { Loader2, FileDown, FileCheck2 } from "lucide-react";

export default function AdminFinalReportReview() {
  const [records, setRecords] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [searchName, setSearchName] = useState("");
  const [reviewRecord, setReviewRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [reports, parts] = await Promise.all([
        finalReportsService.getAll(),
        participantsService.getAll(),
      ]);
      const enriched = reports.map((r) => {
        const p = parts.find((pp) => pp.id === r.userId || pp.email === r.nama);
        return {
          ...r,
          nama: r.nama || p?.namaLengkap || "Unknown",
        };
      });
      setRecords(enriched.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      setParticipants(parts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = records.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (searchName && !r.nama?.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  });

  const pendingCount = records.filter((r) => r.status === "pending").length;
  const approvedCount = records.filter((r) => r.status === "approved").length;
  const rejectedCount = records.filter((r) => r.status === "rejected").length;

  const handleApprove = async (reviewNote) => {
    setSaving(true);
    try {
      await finalReportsService.update(reviewRecord.id, {
        status: "approved",
        reviewNote: reviewNote || "",
      });
      setReviewRecord(null);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async (reviewNote) => {
    setSaving(true);
    try {
      await finalReportsService.update(reviewRecord.id, {
        status: "rejected",
        reviewNote,
      });
      setReviewRecord(null);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await generateFinalReportPDF(filtered, participants);
    } catch (err) {
      console.error(err);
      alert("Gagal mengeksport PDF: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Laporan Akhir</h1>
          <p className="text-muted-foreground mt-1">
            Melihat dan menetuka laporan akhir magang
          </p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="neo-btn neo-btn-black">
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Meneksport...
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4" />
              Export PDF
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="neo-card p-4 text-center">
          <p className="text-3xl font-black text-neo-yellow">{pendingCount}</p>
          <p className="text-xs font-bold mt-1">Pending</p>
        </div>
        <div className="neo-card p-4 text-center">
          <p className="text-3xl font-black text-neo-green">{approvedCount}</p>
          <p className="text-xs font-bold mt-1">Disetujui</p>
        </div>
        <div className="neo-card p-4 text-center">
          <p className="text-3xl font-black text-neo-pink">{rejectedCount}</p>
          <p className="text-xs font-bold mt-1">Ditolak</p>
        </div>
      </div>

      {/* Filters */}
      <div className="neo-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`neo-btn text-xs px-3 py-1.5 ${
                filter === f ? "neo-btn-black" : ""
              }`}
            >
              {f === "all" ? "Semua" : f === "pending" ? "Pending" : f === "approved" ? "Disetujui" : "Ditolak"}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Mencari nama mahasiswa..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="neo-input sm:max-w-xs"
        />
      </div>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="neo-card p-8 text-center">
          <FileCheck2 className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No laporan akhir found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <ReportCard key={r.id} record={r} onReview={setReviewRecord} />
          ))}
        </div>
      )}

      {reviewRecord && (
        <ReviewModal
          record={reviewRecord}
          type="report"
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setReviewRecord(null)}
          saving={saving}
        />
      )}
    </div>
  );
}