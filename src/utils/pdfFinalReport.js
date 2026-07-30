import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  addHeader,
  addFooter,
  fetchImageAsDataURL,
  formatDateTime,
  STATUS_LABELS,
  NEO_COLORS,
} from "@/utils/pdfGenerator";

// NOTE: All images (r.fotoUrl) and PDF links (r.pdfUrl) are Cloudinary secure_url stored in Firestore.
// fetchImageAsDataURL uses native fetch() which works with any HTTPS URL.

export async function generateFinalReportPDF(records, participants) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Cover Page
  doc.setFillColor(...NEO_COLORS.pink);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  doc.setFillColor(...NEO_COLORS.black);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20, "F");

  doc.setTextColor(...NEO_COLORS.pink);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN", pageWidth / 2, 60, { align: "center" });
  doc.text("AKHIR MAGANG", pageWidth / 2, 80, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...NEO_COLORS.white);
  doc.text("KAMPUS UNIVERSITAS INTERNHUB", pageWidth / 2, 110, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...NEO_COLORS.pink);
  doc.text(
    `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`,
    pageWidth / 2,
    130,
    { align: "center" }
  );

  doc.setFontSize(10);
  doc.setTextColor(...NEO_COLORS.white);
  doc.text(`Total Reports: ${records.length}`, pageWidth / 2, 150, { align: "center" });

  const pending = records.filter((r) => r.status === "pending").length;
  const approved = records.filter((r) => r.status === "approved").length;
  const rejected = records.filter((r) => r.status === "rejected").length;

  doc.text(`Pending: ${pending} | Disetujui: ${approved} | Ditolak: ${rejected}`, pageWidth / 2, 160, {
    align: "center",
  });

  // Table Page
  doc.addPage();
  addHeader(doc, "Tabel Laporan Akhir Magang");

  const tableData = records.map((r) => [
    r.nama || "-",
    (r.judul || "-").substring(0, 40),
    (r.deskripsi || "-").substring(0, 50),
    STATUS_LABELS[r.status] || r.status || "-",
    (r.reviewNote || "-").substring(0, 30),
    formatDateTime(r.createdAt),
  ]);

  autoTable(doc, {
    startY: 55,
    head: [
      ["Nama", "Judul", "Deskripsi", "Status", "Catatan Admin", "Tanggal Upload"],
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
      1: { cellWidth: 35 },
      2: { cellWidth: 45 },
    },
  });

  // Photo Documentation Pages
  for (const r of records) {
    if (!r.fotoUrl) continue;
    doc.addPage();
    addHeader(doc, `Foto Dokumentasi - ${r.nama || "Unknown"}`);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Nama: ${r.nama || "-"}`, 14, 60);
    doc.text(`Judul: ${r.judul || "-"}`, 14, 67);
    doc.text(`Status: ${STATUS_LABELS[r.status] || r.status}`, 14, 74);

    doc.setFont("helvetica", "normal");
    doc.text(`Deskripsi: ${(r.deskripsi || "-").substring(0, 80)}`, 14, 84);
    if (r.reviewNote) {
      doc.text(`Catatan Admin: ${r.reviewNote}`, 14, 91);
    }

    const imgData = await fetchImageAsDataURL(r.fotoUrl);
    if (imgData) {
      try {
        const imgWidth = 120;
        const imgHeight = 90;
        const x = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, "JPEG", x, 100, imgWidth, imgHeight);
        doc.setDrawColor(...NEO_COLORS.black);
        doc.setLineWidth(1);
        doc.rect(x, 100, imgWidth, imgHeight);
      } catch {
        doc.text("[Foto tidak tersedia]", pageWidth / 2, 140, { align: "center" });
      }
    }

    if (r.pdfUrl) {
      doc.setFontSize(8);
      doc.setTextColor(...NEO_COLORS.blue);
      doc.textWithLink("Klik untuk mengunduh PDF Laporan", 14, 200, { url: r.pdfUrl });
    }
  }

  addFooter(doc);
  doc.save(`Laporan_Akhir_Magang_${new Date().toISOString().split("T")[0]}.pdf`);
}