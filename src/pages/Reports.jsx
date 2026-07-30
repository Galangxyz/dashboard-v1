import { useState, useEffect } from "react";
import {
  participantsService,
  internshipsService,
  attendanceService,
  finalReportsService,
  evaluationsService,
  internshipStatusService,
} from "@/services/firestoreService";
import { generateAttendancePDF } from "@/utils/pdfAttendance";
import { generateFinalReportPDF } from "@/utils/pdfFinalReport";
import { generatePortfolioPDF } from "@/utils/pdfPortfolio";
import {
  Loader2,
  FileText,
  FileCheck2,
  Users,
  Star,
  UserCheck,
  FileDown,
} from "lucide-react";

const colorMap = {
  "neo-yellow": "bg-neo-yellow",
  "neo-pink": "bg-neo-pink",
  "neo-blue": "bg-neo-blue",
  "neo-purple": "bg-neo-purple",
  "neo-green": "bg-neo-green",
};

export default function Reports() {
  const [participants, setParticipants] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [internships, setInternships] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");

  const load = async () => {
    try {
      const [p, a, r, e, i, s] = await Promise.all([
        participantsService.getAll(),
        attendanceService.getAll(),
        finalReportsService.getAll(),
        evaluationsService.getAll(),
        internshipsService.getAll(),
        internshipStatusService.getAll(),
      ]);
      setParticipants(p);
      setAttendance(a);
      setReports(r);
      setEvaluations(e);
      setInternships(i);
      setStatuses(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const exportAttendance = async () => {
    setExporting("attendance");
    try {
      await generateAttendancePDF(attendance, participants);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setExporting(null);
  };

  const exportFinalReports = async () => {
    setExporting("reports");
    try {
      await generateFinalReportPDF(reports, participants);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setExporting(null);
  };

  const exportParticipants = async () => {
    setExporting("participants");
    try {
      const jsPDFMod = await import("jspdf");
      const autoTableMod = await import("jspdf-autotable");
      const doc = new jsPDFMod.default();
      const { addHeader, addFooter, NEO_COLORS } = await import("@/utils/pdfGenerator");

      addHeader(doc, "Data Peserta Magang");

      const tableData = participants.map((p) => [
        p.nim || "-",
        p.namaLengkap || "-",
        p.programStudi || "-",
        p.angkatan || "-",
        p.email || "-",
        p.nomorHp || "-",
      ]);

      autoTableMod.default(doc, {
        startY: 55,
        head: [["NIM", "Nama", "Program Studi", "Angkatan", "Email", "Nomor HP"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 3, lineColor: NEO_COLORS.black, lineWidth: 0.5 },
        headStyles: { fillColor: NEO_COLORS.black, textColor: NEO_COLORS.white, fontStyle: "bold" },
        alternateRowStyles: { fillColor: NEO_COLORS.gray },
      });

      addFooter(doc);
      doc.save(`Data_Peserta_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setExporting(null);
  };

  const exportEvaluations = async () => {
    setExporting("evaluations");
    try {
      const jsPDFMod = await import("jspdf");
      const autoTableMod = await import("jspdf-autotable");
      const doc = new jsPDFMod.default();
      const { addHeader, addFooter, NEO_COLORS } = await import("@/utils/pdfGenerator");

      addHeader(doc, "Data Penilaian Mentor");

      const tableData = evaluations.map((e) => {
        const p = participants.find((pp) => pp.id === e.participantId);
        const fields = ["disiplin", "kerjaSama", "komunikasi", "tanggungJawab", "inisiatif"];
        const valid = fields.filter((f) => typeof e[f] === "number");
        const total = valid.reduce((s, f) => s + e[f], 0);
        const score = valid.length > 0 ? Math.round((total / (valid.length * 10)) * 100) : 0;
        return [
          p?.namaLengkap || "-",
          `${e.disiplin ?? "-"}/10`,
          `${e.kerjaSama ?? "-"}/10`,
          `${e.komunikasi ?? "-"}/10`,
          `${e.tanggungJawab ?? "-"}/10`,
          `${e.inisiatif ?? "-"}/10`,
          `${score}%`,
        ];
      });

      autoTableMod.default(doc, {
        startY: 55,
        head: [["Nama", "Disiplin", "Kerja Sama", "Komunikasi", "Tanggung Jawab", "Inisiatif", "Nilai Akhir"]],
        body: tableData,
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 3, lineColor: NEO_COLORS.black, lineWidth: 0.5 },
        headStyles: { fillColor: NEO_COLORS.black, textColor: NEO_COLORS.white, fontStyle: "bold" },
        alternateRowStyles: { fillColor: NEO_COLORS.gray },
      });

      addFooter(doc);
      doc.save(`Data_Penilaian_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setExporting(null);
  };

  const exportPortfolio = async () => {
    if (!selectedStudent) {
      alert("Silakan mengilih mahasiswa.");
      return;
    }
    setExporting("portfolio");
    try {
      const student = participants.find((p) => p.id === selectedStudent);
      if (!student) return;
      const internship = internships.find((i) => i.participantId === student.id);
      const statusRecord = statuses.find((s) => s.participantId === student.id);
      await generatePortfolioPDF(student, attendance, reports, evaluations, internship, statusRecord);
    } catch (err) {
      alert("Gagal: " + err.message);
    }
    setExporting(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const reportButtons = [
    {
      key: "attendance",
      title: "Export Semua Kehadiran PDF",
      desc: "Laporan lengkap semua data absensi mahasiswa",
      icon: FileText,
      color: "neo-yellow",
      action: exportAttendance,
    },
    {
      key: "reports",
      title: "Export Semua Laporan Akhir PDF",
      desc: "Laporan lengkap semua laporan akhir magang",
      icon: FileCheck2,
      color: "neo-pink",
      action: exportFinalReports,
    },
    {
      key: "participants",
      title: "Export Data Peserta PDF",
      desc: "Daftar lengkap peserta magang",
      icon: Users,
      color: "neo-blue",
      action: exportParticipants,
    },
    {
      key: "evaluations",
      title: "Export Data Penilaian PDF",
      desc: "Daftar lengkap penilaian mentor",
      icon: Star,
      color: "neo-purple",
      action: exportEvaluations,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Laporan PDF</h1>
        <p className="text-muted-foreground mt-1">
          Meneksport data monitoring magang dalam format PDF
        </p>
      </div>

      {/* Export Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reportButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={btn.action}
            disabled={exporting !== null}
            className="neo-card p-6 text-left hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50"
          >
            <div className={`w-12 h-12 rounded-xl border-[3px] border-black ${colorMap[btn.color]} flex items-center justify-center mb-4`}>
              <btn.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base mb-1">{btn.title}</h3>
            <p className="text-sm text-muted-foreground">{btn.desc}</p>
            {exporting === btn.key && (
              <div className="flex items-center gap-2 mt-3 text-sm font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                Meneksport...
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Portfolio Export */}
      <div className="neo-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl border-[3px] border-black bg-neo-green flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">Export Portofolio Mahasiswa PDF</h3>
            <p className="text-sm text-muted-foreground">
              Meneksport portofolio lengkap per mahasiswa (cover, absensi, laporan, nilai)
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="neo-input flex-1"
          >
            <option value="">-- Mengilih Mahasiswa --</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaLengkap} ({p.nim})
              </option>
            ))}
          </select>
          <button
            onClick={exportPortfolio}
            disabled={exporting !== null || !selectedStudent}
            className="neo-btn neo-btn-black"
          >
            {exporting === "portfolio" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Meneksport...
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4" />
                Generate Portofolio
              </>
            )}
          </button>
        </div>
        {participants.length === 0 && (
          <p className="text-sm text-muted-foreground mt-3">
            No peserta magang found. Mengambah peserta pertama.
          </p>
        )}
      </div>
    </div>
  );
}