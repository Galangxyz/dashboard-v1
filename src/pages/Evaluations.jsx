import { useState, useEffect } from "react";
import {
  evaluationsService,
  participantsService,
  calculateEvaluationScore,
} from "@/services/firestoreService";
import {
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Star,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const emptyForm = {
  participantId: "",
  disiplin: 5,
  kerjaSama: 5,
  komunikasi: 5,
  tanggungJawab: 5,
  inisiatif: 5,
  catatanMentor: "",
};

const CRITERIA = [
  { key: "disiplin", label: "Disiplin" },
  { key: "kerjaSama", label: "Kerja Sam" },
  { key: "komunikasi", label: "Komunikasi" },
  { key: "tanggungJawab", label: "Tanggung Jawab" },
  { key: "inisiatif", label: "Inisiatif" },
];

export default function Evaluations() {
  const [evaluations, setEvaluations] = useState([]);
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
      const [e, p] = await Promise.all([
        evaluationsService.getAll(),
        participantsService.getAll(),
      ]);
      setEvaluations(e);
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

  const currentScore = calculateEvaluationScore(form);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataWithScore = { ...form, nilaiAkhir: currentScore };
      if (editingId) {
        await evaluationsService.update(editingId, dataWithScore);
      } else {
        await evaluationsService.create(dataWithScore);
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
      disiplin: item.disiplin || 5,
      kerjaSama: item.kerjaSama || 5,
      komunikasi: item.komunikasi || 5,
      tanggungJawab: item.tanggungJawab || 5,
      inisiatif: item.inisiatif || 5,
      catatanMentor: item.catatanMentor || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await evaluationsService.remove(deleteTarget);
    setDeleteTarget(null);
    await load();
  };

  const scoreColor = (score) => {
    if (score >= 80) return "bg-neo-green";
    if (score >= 60) return "neo-yellow";
    if (score >= 40) return "bg-neo-blue";
    return "bg-neo-pink";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Penilaian Mentor</h1>
          <p className="text-muted-foreground mt-1">Mentor evaluations & scoring</p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="neo-btn neo-btn-purple"
        >
          <Plus className="w-5 h-5" />
          Add Evaluation
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : evaluations.length === 0 ? (
        <div className="neo-card p-12 text-center">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No evaluations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((ev) => {
            const score = ev.nilaiAkhir ?? calculateEvaluationScore(ev);
            return (
              <div key={ev.id} className="neo-card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-base">{getParticipantName(ev.participantId)}</h3>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(ev)} className="neo-btn px-2 py-1.5">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(ev.id)} className="neo-btn neo-btn-pink px-2 py-1.5">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className={`neo-badge ${scoreColor(score)} mb-3`}>
                  Score: {score}/100
                </div>
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {CRITERIA.map((c) => (
                    <div key={c.key} className="text-center">
                      <p className="text-lg font-bold">{ev[c.key] ?? 0}</p>
                      <p className="text-[10px] font-medium text-muted-foreground leading-tight">
                        {c.label}
                      </p>
                    </div>
                  ))}
                </div>
                {ev.catatanMentor && (
                  <p className="text-xs text-muted-foreground border-t-[2px] border-black/20 dark:border-white/20 pt-2">
                    {ev.catatanMentor}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="neo-card max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Evaluation" : "Add Evaluation"}
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
              {CRITERIA.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="neo-label mb-0">{c.label}</label>
                    <span className="text-sm font-bold">{form[c.key]}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={form[c.key]}
                    onChange={(e) => setForm({ ...form, [c.key]: parseInt(e.target.value) })}
                    className="w-full accent-black"
                  />
                </div>
              ))}
              <div>
                <label className="neo-label">Catatan Mentor</label>
                <textarea
                  value={form.catatanMentor}
                  onChange={(e) => setForm({ ...form, catatanMentor: e.target.value })}
                  className="neo-input min-h-[80px]"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="p-3 rounded-xl border-[3px] border-black dark:border-white bg-neo-yellow text-center">
                <p className="text-sm font-bold">Nilai Akhir: {currentScore}/100</p>
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
        title="Delete Evaluation"
        message="Are you sure you want to delete this evaluation?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}