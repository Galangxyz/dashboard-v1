import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDoc,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

function createService(name) {
  return {
    async getAll() {
      const snap = await getDocs(collection(db, name));
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    async getById(id) {
      const d = await getDoc(doc(db, name, id));
      return d.exists() ? { id: d.id, ...d.data() } : null;
    },
    async create(data) {
      const ref = await addDoc(collection(db, name), {
        ...data,
        createdAt: serverTimestamp(),
      });
      return { id: ref.id, ...data };
    },
    async update(id, data) {
      await updateDoc(doc(db, name, id), data);
      return { id, ...data };
    },
    async remove(id) {
      await deleteDoc(doc(db, name, id));
      return id;
    },
    async getByField(field, value) {
      const q = query(collection(db, name), where(field, "==", value));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    subscribe(callback) {
      const q = query(collection(db, name), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snap) => {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });
    },
  };
}

export const participantsService = createService("participants");
export const internshipsService = createService("internships");
export const attendanceService = createService("attendance");
export const evaluationsService = createService("evaluations");
export const internshipStatusService = createService("internship_status");
export const usersService = createService("users");

export function calculateEvaluationScore(ev) {
  const fields = ["disiplin", "kerjaSama", "komunikasi", "tanggungJawab", "inisiatif"];
  const valid = fields.filter((f) => typeof ev[f] === "number" && ev[f] >= 0);
  if (valid.length === 0) return 0;
  const total = valid.reduce((sum, f) => sum + ev[f], 0);
  return Math.round((total / (valid.length * 10)) * 100);
}