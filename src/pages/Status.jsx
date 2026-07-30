import { useState, useEffect } from "react";
import { internshipStatusService, participantsService } from "@/services/firestoreService";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Activity,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_OPTIONS = ["Belum Mulai", "Sedang Magang", "Selesai", "Dibatalkan"];

const emptyForm = {
  participantId: "",
  status: "Belum Mulai",
  tanggalMulai: "",
  tanggalSelesai: "",
  progress: 0,
};

const statusColor = (status) => {
  switch (status) {
    case "Sedang Magang": return "bg-neo-blue";
    case "Selesai": return "bg-neo-green";
    case "Belum Mulai": return "neo-yellow";
    case "Dibatalkan": return "bg-neo-pink";
    default: return "bg-neo-gray";
  }
};

export default function Status() {
  const [statuses, setStatuses] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        internshipStatusService.getAll(),
        participantsService.getAll(),
      ]);
      setStatuses(s);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await internshipStatusService.update(editingId, form);
      } else {
        await internshipStatusService.create(form);
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
      status: item.status || "Belum Mulai",
      tanggalMulai: item.tanggalMulai || "",
      tanggalSelesai: item.tanggalSelesai || "",
      progress: item.progress || 0,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await internshipStatusService.remove(deleteTarget);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status Magang</h1>
          <p className="text-muted-foreground mt-1">Track internship progress & status</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="neo-btn neo-btn-blue"
        >
          <Plus className="w-5 h-5" />
          Add Status
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : statuses.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No status records found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statuses.map((s) => (
            <div key={s.id} className="neo-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg">{getParticipantName(s.participantId)}</h3>
                  <span className={`neo-badge ${statusColor(s.status)} mt-1`}>
                    {s.status}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(s)} className="neo-btn px-2 py-1.5">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(s.id)} className="neo-btn neo-btn-pink px-2 py-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Mulai:</span>
                  <span>{s.tanggalMulai || "-"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold">Selesai:</span>
                  <span>{s.tanggalSelesai || "-"}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Progress</span>
                  <span>{s.progress || 0}%</span>
                </div>
                <div className="w-full h-4 bg-neo-gray dark:bg-neutral-800 rounded-full border-[2px] border-black dark:border-white overflow-hidden">
                  <div
                    className="h-full bg-neo-green transition-all"
                    style={{ width: `${s.progress || 0}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="neo-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Status" : "Add Status"}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="neo-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={form.tanggalMulai}
                    onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                    className="neo-input"
                  />
                </div>
                <div>
                  <label className="neo-label">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={form.tanggalSelesai}
                    onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                    className="neo-input"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="neo-label mb-0">Progress</label>
                  <span className="text-sm font-bold">{form.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.progress}
                  onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) })}
                  className="w-full accent-black"
                />
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
        title="Delete Status"
        message="Are you sure you want to delete this status record?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}