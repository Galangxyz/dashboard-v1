import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  addHeader,
  addFooter,
  fetchImageAsDataURL,
  formatDate,
  formatDateTime,
  STATUS_LABELS,
  NEO_COLORS,
} from "@/utils/pdfGenerator";

// NOTE: All images (fotoKegiatan, fotoUrl) and PDF links (pdfUrl) are Cloudinary secure_url stored in Firestore.
// fetchImageAsDataURL uses native fetch() which works with any HTTPS URL.

export async function generatePortfolioPDF(
  student,
  attendanceRecords,
  finalReports,
  evaluations,
  internship,
  statusRecord
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Filter student data
  const myAttendance = attendanceRecords.filter(
    (a) => a.nama === student.namaLengkap || a.userId === student.id
  );
  const myReports = finalReports.filter(
    (r) => r.nama === student.namaLengkap || r.userId === student.id
  );
  const myEval = evaluations.find(
    (e) => e.participantId === student.id
  );

  // ===== PAGE 1: COVER =====
  doc.setFillColor(...NEO_COLORS.purple);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(...NEO_COLORS.black);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "F");

  doc.setTextColor(...NEO_COLORS.purple);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("PORTOFOLIO", pageWidth / 2, 50, { align: "center" });
  doc.text("MAGANG MAHASISWA", pageWidth / 2, 68, { align: "center" });

  doc.setDrawColor(...NEO_COLORS.purple);
  doc.setLineWidth(1);
  doc.line(60, 78, pageWidth - 60, 78);

  doc.setFontSize(14);
  doc.setTextColor(...NEO_COLORS.white);
  doc.text(student.namaLengkap || "-", pageWidth / 2, 100, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...NEO_COLORS.yellow);
  doc.text(`NIM: ${student.nim || "-"}`, pageWidth / 2, 115, { align: "center" });
  doc.text(`Program Studi: ${student.programStudi || "-"}`, pageWidth / 2, 125, { align: "center" });

  if (internship) {
    doc.text(`Tempat Magang: ${internship.namaPerusahaan || "-"}`, pageWidth / 2, 140, {
      align: "center",
    });
    doc.text(
      `Periode: ${formatDate(internship.tanggalMulai)} - ${formatDate(internship.tanggalSelesai)}`,
      pageWidth / 2,
      150,
      { align: "center" }
    );
  }

  doc.setFontSize(8);
  doc.setTextColor(...NEO_COLORS.gray);
  doc.text(`Generated: ${new Date().toLocaleDateString("id-ID")}`, pageWidth / 2, pageHeight - 25, {
    align: "center",
  });

  // ===== PAGE 2: RINGKASAN KEHADIRAN =====
  doc.addPage();
  addHeader(doc, "Ringkasan Kehadiran");

  const totalHadir = myAttendance.filter((a) => a.status === "approved").length;
  const totalPending = myAttendance.filter((a) => a.status === "pending").length;
  const totalRejected = myAttendance.filter((a) => a.status === "rejected").length;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Nama: ${student.namaLengkap}`, 14, 60);
  doc.text(`NIM: ${student.nim}`, 14, 68);

  doc.setFontSize(14);
  doc.setTextColor(...NEO_COLORS.black);
  doc.text("Ringkasan Kehadiran:", 14, 85);

  // Stats boxes
  const boxY = 95;
  const boxW = 50;
  const boxH = 40;

  doc.setFillColor(...NEO_COLORS.green);
  doc.rect(14, boxY, boxW, boxH, "F");
  doc.setDrawColor(...NEO_COLORS.black);
  doc.setLineWidth(1);
  doc.rect(14, boxY, boxW, boxH);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(totalHadir), 14 + boxW / 2, boxY + 22, { align: "center" });
  doc.setFontSize(8);
  doc.text("Disetujui", 14 + boxW / 2, boxY + 33, { align: "center" });

  doc.setFillColor(...NEO_COLORS.yellow);
  doc.rect(14 + boxW + 10, boxY, boxW, boxH, "F");
  doc.rect(14 + boxW + 10, boxY, boxW, boxH);
  doc.setFontSize(20);
  doc.text(String(totalPending), 14 + boxW + 10 + boxW / 2, boxY + 22, { align: "center" });
  doc.setFontSize(8);
  doc.text("Pending", 14 + boxW + 10 + boxW / 2, boxY + 33, { align: "center" });

  doc.setFillColor(...NEO_COLORS.pink);
  doc.rect(14 + (boxW + 10) * 2, boxY, boxW, boxH, "F");
  doc.rect(14 + (boxW + 10) * 2, boxY, boxW, boxH);
  doc.setFontSize(20);
  doc.text(String(totalRejected), 14 + (boxW + 10) * 2 + boxW / 2, boxY + 22, { align: "center" });
  doc.setFontSize(8);
  doc.text("Ditolak", 14 + (boxW + 10) * 2 + boxW / 2, boxY + 33, { align: "center" });

  // Simple bar chart
  const chartY = 160;
  const chartW = 160;
  const chartH = 50;
  doc.setDrawColor(...NEO_COLORS.black);
  doc.setLineWidth(0.5);
  doc.line(14, chartY + chartH, 14 + chartW, chartY + chartH);
  doc.line(14, chartY, 14, chartY + chartH);

  const maxVal = Math.max(totalHadir, totalPending, totalRejected, 1);
  const barW = 25;
  const drawBar = (val, color, x) => {
    const h = (val / maxVal) * chartH;
    doc.setFillColor(...color);
    doc.rect(x, chartY + chartH - h, barW, h, "F");
    doc.setDrawColor(...NEO_COLORS.black);
    doc.setLineWidth(0.5);
    doc.rect(x, chartY + chartH - h, barW, h);
    doc.setFontSize(8);
    doc.text(String(val), x + barW / 2, chartY + chartH - h - 2, { align: "center" });
  };

  drawBar(totalHadir, NEO_COLORS.green, 30);
  drawBar(totalPending, NEO_COLORS.yellow, 70);
  drawBar(totalRejected, NEO_COLORS.pink, 110);

  doc.setFontSize(7);
  doc.text("Disetujui", 30 + barW / 2, chartY + chartH + 8, { align: "center" });
  doc.text("Pending", 70 + barW / 2, chartY + chartH + 8, { align: "center" });
  doc.text("Ditolak", 110 + barW / 2, chartY + chartH + 8, { align: "center" });

  // ===== PAGE 3+: DAFTAR AKTIVITAS HARIAN =====
  const approvedAttendance = myAttendance.filter((a) => a.fotoKegiatan);

  for (let i = 0; i < approvedAttendance.length; i++) {
    const r = approvedAttendance[i];
    if (i % 2 === 0) {
      doc.addPage();
      addHeader(doc, "Daftar Aktivitas Harian");
    }
    const yBase = i % 2 === 0 ? 60 : 150;

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Tanggal: ${r.tanggal || formatDate(r.createdAt)}`, 14, yBase);
    doc.setFont("helvetica", "normal");
    doc.text(`Jam: ${r.jamMasuk || "-"}`, 80, yBase);
    doc.text(`Lokasi: ${(r.alamat || "-").substring(0, 50)}`, 14, yBase + 7);
    doc.text(`Aktivitas: ${r.aktivitas || "-"}`, 14, yBase + 14);

    const imgData = await fetchImageAsDataURL(r.fotoKegiatan);
    if (imgData) {
      try {
        doc.addImage(imgData, "JPEG", 14, yBase + 20, 60, 45);
        doc.setDrawColor(...NEO_COLORS.black);
        doc.setLineWidth(0.5);
        doc.rect(14, yBase + 20, 60, 45);
      } catch {
        doc.text("[Foto]", 14, yBase + 30);
      }
    }
  }

  // ===== LAST PAGE: LAPORAN AKHIR + NILAI =====
  doc.addPage();
  addHeader(doc, "Laporan Akhir & Nilai Mentor");

  let y = 60;

  // Final Report
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Laporan Akhir Magang", 14, y);
  y += 10;

  if (myReports.length > 0) {
    const report = myReports[0];
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Judul: ${report.judul}`, 14, y);
    y += 7;
    doc.setFont("helvetica", "normal");
    const desc = report.deskripsi || "-";
    const lines = doc.splitTextToSize(desc, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 5 + 5;
    doc.text(`Status: ${STATUS_LABELS[report.status] || report.status}`, 14, y);
    y += 7;

    if (report.fotoUrl) {
      const imgData = await fetchImageAsDataURL(report.fotoUrl);
      if (imgData) {
        try {
          doc.addImage(imgData, "JPEG", 14, y, 80, 60);
          doc.setDrawColor(...NEO_COLORS.black);
          doc.setLineWidth(0.5);
          doc.rect(14, y, 80, 60);
          y += 70;
        } catch {
          y += 10;
        }
      }
    }

    if (report.pdfUrl) {
      doc.setFontSize(8);
      doc.setTextColor(...NEO_COLORS.blue);
      doc.textWithLink("Klik untuk mengunduh PDF Laporan", 100, y - 60, { url: report.pdfUrl });
      doc.setTextColor(...NEO_COLORS.black);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No laporan akhir mengirim.", 14, y);
    y += 10;
  }

  // Nilai Mentor
  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Nilai Mentor", 14, y);
  y += 10;

  if (myEval) {
    const evalData = [
      ["Disiplin", `${myEval.disiplin ?? "-"}/10`],
      ["Kerja Sama", `${myEval.kerjaSama ?? "-"}/10`],
      ["Komunikasi", `${myEval.komunikasi ?? "-"}/10`],
      ["Tanggung Jawab", `${myEval.tanggungJawab ?? "-"}/10`],
      ["Inisiatif", `${myEval.inisiatif ?? "-"}/10`],
    ];

    autoTable(doc, {
      startY: y,
      head: [["Kriteria", "Nilai"]],
      body: evalData,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 4, lineColor: NEO_COLORS.black, lineWidth: 0.5 },
      headStyles: { fillColor: NEO_COLORS.black, textColor: NEO_COLORS.white, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 60 } },
    });

    y = doc.lastAutoTable.finalY + 10;

    const fields = ["disiplin", "kerjaSama", "komunikasi", "tanggungJawab", "inisiatif"];
    const valid = fields.filter((f) => typeof myEval[f] === "number");
    const total = valid.reduce((s, f) => s + myEval[f], 0);
    const score = valid.length > 0 ? Math.round((total / (valid.length * 10)) * 100) : 0;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Nilai Akhir: ${score}%`, 14, y);
    y += 10;

    if (myEval.catatanMentor) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Catatan Mentor:", 14, y);
      y += 5;
      const noteLines = doc.splitTextToSize(myEval.catatanMentor, pageWidth - 28);
      doc.text(noteLines, 14, y);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No penilaian mentor available.", 14, y);
  }

  // Status Magang
  y += 20;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Status Magang", 14, y);
  y += 10;

  if (statusRecord) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Status: ${statusRecord.status || "-"}`, 14, y);
    y += 7;
    doc.text(`Mulai: ${formatDate(statusRecord.tanggalMulai)}`, 14, y);
    y += 7;
    doc.text(`Selesai: ${formatDate(statusRecord.tanggalSelesai)}`, 14, y);
    if (statusRecord.progress) {
      y += 7;
      doc.text(`Progress: ${statusRecord.progress}%`, 14, y);
    }
  } else {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("No status magang available.", 14, y);
  }

  addFooter(doc);
  doc.save(`Portofolio_${student.namaLengkap || "Mahasiswa"}_${new Date().toISOString().split("T")[0]}.pdf`);
}