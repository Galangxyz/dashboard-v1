import jsPDF from "jspdf";

export const KAMPUS_NAME = "KAMPUS UNIVERSITAS INTERNHUB";
export const KAMPUS_SUBTITLE = "Sistem Monitoring Magang Mahasiswa";

export const NEO_COLORS = {
  yellow: [253, 224, 71],
  blue: [96, 165, 250],
  green: [74, 222, 128],
  pink: [251, 113, 133],
  purple: [167, 139, 250],
  black: [0, 0, 0],
  white: [255, 255, 255],
  gray: [244, 244, 240],
};

export function addHeader(doc, title) {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...NEO_COLORS.yellow);
  doc.rect(0, 0, pageWidth, 8, "F");

  doc.setFillColor(...NEO_COLORS.black);
  doc.rect(0, 8, pageWidth, 25, "F");

  doc.setTextColor(...NEO_COLORS.white);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(KAMPUS_NAME, 14, 18);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...NEO_COLORS.yellow);
  doc.text(KAMPUS_SUBTITLE, 14, 24);

  doc.setTextColor(...NEO_COLORS.black);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 45);

  doc.setDrawColor(...NEO_COLORS.black);
  doc.setLineWidth(0.5);
  doc.line(14, 50, pageWidth - 14, 50);
}

export function addFooter(doc) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageCount = doc.internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setDrawColor(...NEO_COLORS.black);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFontSize(8);
    doc.setTextColor(...NEO_COLORS.black);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Generated: ${new Date().toLocaleString("id-ID")}`,
      14,
      pageHeight - 10
    );
    doc.text(
      `Page ${i} / ${pageCount}`,
      pageWidth - 40,
      pageHeight - 10
    );
  }
}

export async function fetchImageAsDataURL(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function formatDate(ts) {
  if (!ts) return "-";
  if (ts.toDate) return ts.toDate().toLocaleDateString("id-ID");
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString("id-ID");
  if (typeof ts === "string") return ts;
  return "-";
}

export function formatDateTime(ts) {
  if (!ts) return "-";
  if (ts.toDate) return ts.toDate().toLocaleString("id-ID");
  if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString("id-ID");
  if (typeof ts === "string") return ts;
  return "-";
}

export const STATUS_LABELS = {
  pending: "Pending",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export { jsPDF };