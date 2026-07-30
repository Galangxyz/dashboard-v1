import { useState, useEffect } from "react";
import { internshipsService, participantsService } from "@/services/firestoreService";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Building2,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  namaPerusahaan: "",
  alamat: "",
  mentor: "",
  tanggalMulai: "",
  tanggalSelesai: "",
  participantId: "",
};

export default function Internships() {
  const [internships, setInternships] = useState([]);
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
      const [i, p] = await Promise.all([
        internshipsService.getAll(),
        participantsService.getAll(),
      ]);
      setInternships(i);
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
    return p ? p.namaLengkap : "Unassigned";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await internshipsService.update(editingId, form);
      } else {
        await internshipsService.create(form);
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
      namaPerusahaan: item.namaPerusahaan || "",
      alamat: item.alamat || "",
      mentor: item.mentor || "",
      tanggalMulai: item.tanggalMulai || "",
      tanggalSelesai: item.tanggalSelesai || "",
      participantId: item.participantId || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await internshipsService.remove(deleteTarget);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tempat Magang</h1>
          <p className="text-muted-foreground mt-1">
            Manage internship placements
          </p>
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
          Add Perusahaan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : internships.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No internships found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((item) => (
            <div key={item.id} className="neo-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-neo-blue rounded-lg border-[3px] border-black dark:border-white flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="neo-btn px-2 py-1.5">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item.id)} className="neo-btn neo-btn-pink px-2 py-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1">{item.namaPerusahaan}</h3>
              <p className="text-sm text-muted-foreground mb-3">{item.alamat}</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-bold">Mentor:</span> {item.mentor}</p>
                <p><span className="font-bold">Peserta:</span> {getParticipantName(item.participantId)}</p>
                <p className="text-xs text-muted-foreground">
                  {item.tanggalMulai} → {item.tanggalSelesai}
                </p>
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
                {editingId ? "Edit Perusahaan" : "Add Perusahaan"}
              </h2>
              <button onClick={() => setShowForm(false)} className="neo-btn px-2 py-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="neo-label">Nama Perusahaan</label>
                <input
                  type="text"
                  required
                  value={form.namaPerusahaan}
                  onChange={(e) => setForm({ ...form, namaPerusahaan: e.target.value })}
                  className="neo-input"
                  placeholder="Company name"
                />
              </div>
              <div>
                <label className="neo-label">Alamat</label>
                <textarea
                  required
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="neo-input min-h-[80px]"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="neo-label">Mentor</label>
                <input
                  type="text"
                  required
                  value={form.mentor}
                  onChange={(e) => setForm({ ...form, mentor: e.target.value })}
                  className="neo-input"
                  placeholder="Mentor name"
                />
              </div>
              <div>
                <label className="neo-label">Peserta Magang</label>
                <select
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
        title="Delete Perusahaan"
        message="Are you sure you want to delete this internship placement?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}