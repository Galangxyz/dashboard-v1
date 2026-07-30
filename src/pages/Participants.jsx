import { useState, useEffect } from "react";
import { participantsService } from "@/services/firestoreService";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Users,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

const PROGRAM_STUDI = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
];

const emptyForm = {
  nim: "",
  namaLengkap: "",
  programStudi: PROGRAM_STUDI[0],
  angkatan: "",
  email: "",
  nomorHp: "",
};

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterProgram, setFilterProgram] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await participantsService.getAll();
      setParticipants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = participants.filter((p) => {
    const matchSearch =
      !search ||
      p.namaLengkap?.toLowerCase().includes(search.toLowerCase()) ||
      p.nim?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase());
    const matchProgram =
      filterProgram === "all" || p.programStudi === filterProgram;
    return matchSearch && matchProgram;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await participantsService.update(editingId, form);
      } else {
        await participantsService.create(form);
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

  const handleEdit = (p) => {
    setForm({
      nim: p.nim || "",
      namaLengkap: p.namaLengkap || "",
      programStudi: p.programStudi || PROGRAM_STUDI[0],
      angkatan: p.angkatan || "",
      email: p.email || "",
      nomorHp: p.nomorHp || "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    await participantsService.remove(deleteTarget);
    setDeleteTarget(null);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peserta Magang</h1>
          <p className="text-muted-foreground mt-1">
            Manage mahasiswa magang data
          </p>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="neo-btn neo-btn-yellow"
        >
          <Plus className="w-5 h-5" />
          Add Peserta
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, NIM, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="neo-input pl-11"
          />
        </div>
        <select
          value={filterProgram}
          onChange={(e) => setFilterProgram(e.target.value)}
          className="neo-input w-auto"
        >
          <option value="all">All Programs</option>
          {PROGRAM_STUDI.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="neo-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No participants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neo-yellow border-b-[3px] border-black dark:border-white">
                <tr>
                  <th className="text-left p-4 font-bold">NIM</th>
                  <th className="text-left p-4 font-bold">Nama Lengkap</th>
                  <th className="text-left p-4 font-bold hidden md:table-cell">Program Studi</th>
                  <th className="text-left p-4 font-bold hidden lg:table-cell">Angkatan</th>
                  <th className="text-left p-4 font-bold hidden lg:table-cell">Email</th>
                  <th className="text-left p-4 font-bold hidden xl:table-cell">Nomor HP</th>
                  <th className="text-right p-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b-[2px] border-black/20 dark:border-white/20 hover:bg-neo-yellow/10"
                  >
                    <td className="p-4 font-mono text-xs">{p.nim}</td>
                    <td className="p-4 font-medium">{p.namaLengkap}</td>
                    <td className="p-4 hidden md:table-cell">{p.programStudi}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{p.angkatan}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground">{p.email}</td>
                    <td className="p-4 hidden xl:table-cell text-muted-foreground">{p.nomorHp}</td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(p)}
                          className="neo-btn px-2 py-1.5"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p.id)}
                          className="neo-btn neo-btn-pink px-2 py-1.5"
                        >
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
                {editingId ? "Edit Peserta" : "Add Peserta"}
              </h2>
              <button onClick={() => setShowForm(false)} className="neo-btn px-2 py-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="neo-label">NIM</label>
                <input
                  type="text"
                  required
                  value={form.nim}
                  onChange={(e) => setForm({ ...form, nim: e.target.value })}
                  className="neo-input"
                  placeholder="e.g. 2024001"
                />
              </div>
              <div>
                <label className="neo-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={form.namaLengkap}
                  onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                  className="neo-input"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="neo-label">Program Studi</label>
                <select
                  value={form.programStudi}
                  onChange={(e) => setForm({ ...form, programStudi: e.target.value })}
                  className="neo-input"
                >
                  {PROGRAM_STUDI.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="neo-label">Angkatan</label>
                <input
                  type="text"
                  value={form.angkatan}
                  onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
                  className="neo-input"
                  placeholder="Cohort/Angkatan"
                />
              </div>
              <div>
                <label className="neo-label">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="neo-input"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="neo-label">Nomor HP</label>
                <input
                  type="tel"
                  value={form.nomorHp}
                  onChange={(e) => setForm({ ...form, nomorHp: e.target.value })}
                  className="neo-input"
                  placeholder="08xxxxxxxxxx"
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
        title="Delete Peserta"
        message="Are you sure you want to delete this participant? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}