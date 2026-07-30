import { useState, useEffect } from "react";
import {
  attendanceService,
  participantsService,
} from "@/services/firestoreService";
import AttendanceCard from "@/components/AttendanceCard";
import ReviewModal from "@/components/ReviewModal";
import { generateAttendancePDF } from "@/utils/pdfAttendance";
import { Loader2, FileDown, ClipboardList } from "lucide-react";

export default function AdminAttendanceReview() {
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
      const [att, parts] = await Promise.all([
        attendanceService.getAll(),
        participantsService.getAll(),
      ]);
      const enriched = att.map((a) => {
        const p = parts.find((pp) => pp.id === a.participantId);
        return {
          ...a,
          nama: a.nama || p?.namaLengkap || "Unknown",
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
      await attendanceService.update(reviewRecord.id, {
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
      await attendanceService.update(reviewRecord.id, {
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
      await generateAttendancePDF(filtered, participants);
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
          <h1 className="text-3xl font-bold tracking-tight">Review Kehadiran</h1>
          <p className="text-muted-foreground mt-1">
            Melihat dan menetuka absensi mahasiswa
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
          <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No absensi records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((r) => (
            <AttendanceCard key={r.id} record={r} onReview={setReviewRecord} />
          ))}
        </div>
      )}

      {reviewRecord && (
        <ReviewModal
          record={reviewRecord}
          type="attendance"
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setReviewRecord(null)}
          saving={saving}
        />
      )}
    </div>
  );
}