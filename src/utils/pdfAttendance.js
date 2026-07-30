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

// NOTE: All images (r.fotoKegiatan) are Cloudinary secure_url stored in Firestore.
// fetchImageAsDataURL uses native fetch() which works with any HTTPS URL.

export async function generateAttendancePDF(records, participants) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cover Page
  doc.setFillColor(...NEO_COLORS.yellow);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(...NEO_COLORS.black);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "F");

  doc.setTextColor(...NEO_COLORS.yellow);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN", pageWidth / 2, 60, { align: "center" });
  doc.text("KEHADIRAN MAGANG", pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...NEO_COLORS.white);
  doc.text("KAMPUS UNIVERSITAS INTERNHUB", pageWidth / 2, 110, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...NEO_COLORS.yellow);
  doc.text(
    `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`,
    pageWidth / 2,
    130,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setTextColor(...NEO_COLORS.white);
  doc.text(`Total Records: ${records.length}`, pageWidth / 2, 150, { align: "center" });

  const pending = records.filter((r) => r.status === "pending").length;
  const approved = records.filter((r) => r.status === "approved").length;
  const rejected = records.filter((r) => r.status === "rejected").length;

  doc.text(`Pending: ${pending} | Disetujui: ${approved} | Ditolak: ${rejected}`, pageWidth / 2, 160, {
    align: "center",
  });

  // Table Page
  doc.addPage();
  addHeader(doc, "Tabel Kehadiran Mahasiswa");

  const tableData = records.map((r) => [
    r.nama || "-",
    r.tanggal || formatDate(r.createdAt),
    r.jamMasuk || "-",
    (r.aktivitas || "-").substring(0, 50),
    (r.alamat || "-").substring(0, 40),
    r.latitude ? r.latitude.toFixed(6) : "-",
    r.longitude ? r.longitude.toFixed(6) : "-",
    STATUS_LABELS[r.status] || r.status || "-",
    (r.reviewNote || "-").substring(0, 30),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [
      [
        "Nama",
        "Tanggal",
        "Jam",
        "Aktivitas",
        "Alamat",
        "Latitude",
        "Longitude",
        "Status",
        "Catatan",
      ],
    ],
    body: tableData,
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 3,
      lineColor: NEO_COLORS.black,
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: NEO_COLORS.black,
      textColor: NEO_COLORS.white,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: NEO_COLORS.gray,
    },
    columnStyles: {
      3: { cellWidth: 40 },
      4: { cellWidth: 35 },
    },
  });

  // Photo Documentation Pages
  const photoRecords = records.filter((r) => r.fotoKegiatan);
  if (photoRecords.length > 0) {
    for (const r of photoRecords) {
      doc.addPage();
      addHeader(doc, `Foto Dokumentasi - ${r.nama || "Unknown"}`);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Nama: ${r.nama || "-"}`, 14, 60);
      doc.text(`Tanggal: ${r.tanggal || formatDate(r.createdAt)}`, 14, 67);
      doc.text(`Jam: ${r.jamMasuk || "-"}`, 14, 74);
      doc.text(`Status: ${STATUS_LABELS[r.status] || r.status}`, 14, 81);

      doc.setFont("helvetica", "normal");
      doc.text(`Aktivitas: ${r.aktivitas || "-"}`, 14, 91);
      doc.text(`Lokasi: ${r.alamat || "-"}`, 14, 98);
      doc.text(
        `GPS: ${r.latitude ? r.latitude.toFixed(6) : "-"}, ${r.longitude ? r.longitude.toFixed(6) : "-"}`,
        14,
        105
      );

      if (r.reviewNote) {
        doc.text(`Catatan Admin: ${r.reviewNote}`, 14, 112);
      }

      const imgData = await fetchImageAsDataURL(r.fotoKegiatan);
      if (imgData) {
        try {
          const imgWidth = 120;
          const imgHeight = 90;
          const x = (pageWidth - imgWidth) / 2;
          doc.addImage(imgData, "JPEG", x, 120, imgWidth, imgHeight);
          doc.setDrawColor(...NEO_COLORS.black);
          doc.setLineWidth(1);
          doc.rect(x, 120, imgWidth, imgHeight);
        } catch {
          doc.text("[Foto tidak tersedia]", pageWidth / 2, 160, { align: "center" });
        }
      } else {
        doc.text("[Foto tidak tersedia]", pageWidth / 2, 160, { align: "center" });
      }
    }
  }

  addFooter(doc);
  doc.save(`Laporan_Kehadiran_${new Date().toISOString().split("T")[0]}.pdf`);
}

export async function generateAttendancePDFByStudent(records, student, allParticipants) {
  const studentRecords = records.filter(
    (r) => r.nama === student.namaLengkap || r.userId === student.id
  );
  if (studentRecords.length === 0) {
    alert("Mahasiswa ini tidak mendapatkan absensi records.");
    return;
  }
  await generateAttendancePDF(studentRecords, allParticipants);
}