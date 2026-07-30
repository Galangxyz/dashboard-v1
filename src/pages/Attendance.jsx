import { useState, useEffect } from "react";
import { attendanceService, participantsService } from "@/services/firestoreService";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_OPTIONS = ["Hadir", "Izin", "Alpha"];

const emptyForm = {
  participantId: "",
  tanggal: "",
  jamMasuk: "",
  jamPulang: "",
  status: "Hadir",
};

const statusColor = (status) => {
  switch (status) {
    case "Hadir": return "bg-neo-green";
    case "Izin": return "neo-yellow";
    case "Alpha": return "bg-neo-pink";
    default: return "bg-neo-gray";
  }
};

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [a, p] = await Promise.all([
        attendanceService.getAll(),
        participantsService.getAll(),
      ]);
      setRecords(a);
      setParticipants(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const getParticipantName = (id) => {
    const p = participants.find((p) => p.id === id);
    return p ? p.namaLengkap : "Unknown";
  };

  const filtered = filterDate
    ? records.filter((r) => r.tanggal === filterDate)
    : records;

  const stats = {
    hadir: filtered.filter((r) => r.status === "Hadir").length,
    izin: filtered.filter((r) => r.status === "Izin").length,
    alpha: filtered.filter((r) => r.status === "Alpha").length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await attendanceService.update(editingId, form);
      } else {
        await attendanceService.create(form);
      }
      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setForm({
      participantId: item.participantId || "",
      tanggal: item.tanggal || "",
      jamMasuk: item.jamMasuk || "",
      jamPulang: item.jamPulang || "",
      status: item.status || "Hadir",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await attendanceService.remove(deleteTarget);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kehadiran</h1>
          <p className="text-muted-foreground mt-1">Attendance management</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="neo-btn neo-btn-green"
        >
          <Plus className="w-5 h-5" />
          Add Absensi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="neo-card p-4 text-center">
          <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.hadir}</p>
          <p className="text-xs font-bold text-muted-foreground">Hadir</p>
        </div>
        <div className="neo-card p-4 text-center">
          <MinusCircle className="w-6 h-6 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.izin}</p>
          <p className="text-xs font-bold text-muted-foreground">Izin</p>
        </div>
        <div className="neo-card p-4 text-center">
          <XCircle className="w-6 h-6 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.alpha}</p>
          <p className="text-xs font-bold text-muted-foreground">Alpha</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex items-center gap-3">
        <label className="neo-label whitespace-nowrap mb-0">Filter by date:</label>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="neo-input w-auto"
        />
        {filterDate && (
          <button onClick={() => setFilterDate("")} className="neo-btn">
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="neo-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No attendance records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neo-green border-b-[3px] border-black dark:border-white">
                <tr>
                  <th className="text-left p-4 font-bold">Peserta</th>
                  <th className="text-left p-4 font-bold">Tanggal</th>
                  <th className="text-left p-4 font-bold hidden md:table-cell">Jam Masuk</th>
                  <th className="text-left p-4 font-bold hidden md:table-cell">Jam Pulang</th>
                  <th className="text-left p-4 font-bold">Status</th>
                  <th className="text-right p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b-[2px] border-black/20 dark:border-white/20 hover:bg-neo-green/10"
                  >
                    <td className="p-4 font-medium">{getParticipantName(r.participantId)}</td>
                    <td className="p-4">{r.tanggal}</td>
                    <td className="p-4 hidden md:table-cell font-mono text-xs">{r.jamMasuk || "-"}</td>
                    <td className="p-4 hidden md:table-cell font-mono text-xs">{r.jamPulang || "-"}</td>
                    <td className="p-4">
                      <span className={`neo-badge ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(r)} className="neo-btn px-2 py-1.5">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(r.id)} className="neo-btn neo-btn-pink px-2 py-1.5">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="neo-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Absensi" : "Add Absensi"}
              </h2>
              <button onClick={() => setShowForm(false)} className="neo-btn px-2 py-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="neo-label">Peserta</label>
                <select
                  required
                  value={form.participantId}
                  onChange={(e) => setForm({ ...form, participantId: e.target.value })}
                  className="neo-input"
                >
                  <option value="">Select peserta...</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.namaLengkap} ({p.nim})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="neo-label">Tanggal</label>
                <input
                  type="date"
                  required
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="neo-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="neo-label">Jam Masuk</label>
                  <input
                    type="time"
                    value={form.jamMasuk}
                    onChange={(e) => setForm({ ...form, jamMasuk: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="neo-label">Jam Pulang</label>
                  <input
                    type="time"
                    value={form.jamPulang}
                    onChange={(e) => setForm({ ...form, jamPulang: e.target.value })}
                    className="neo-input"
                  />
                </div>
              </div>
              <div>
                <label className="neo-label">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="neo-input"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="neo-btn">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="neo-btn neo-btn-green">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Absensi"
        message="Are you sure you want to delete this attendance record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}