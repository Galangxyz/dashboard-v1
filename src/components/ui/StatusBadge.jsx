import React from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  success: "bg-secondary/10 text-secondary",
  warning: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  danger: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
};

export default function StatusBadge({ status, variant = "neutral", className }) {
  const v = variants[variant] || variants.neutral;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium", v, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function getBadgeVariant(status) {
  const map = {
    "Aktif": "success",
    "Tidak Aktif": "danger",
    "Lulus": "blue",
    "Pindah": "warning",
    "Cuti": "warning",
    "Lunas": "success",
    "Belum Bayar": "danger",
    "Cicilan": "warning",
    "Hadir": "success",
    "Sakit": "warning",
    "Izin": "blue",
    "Alpa": "danger",
    "Menunggu": "warning",
    "Diterima": "success",
    "Ditolak": "danger",
    "Dipublikasi": "success",
    "Draft": "neutral",
    "Tinggi": "danger",
    "Sedang": "warning",
    "Rendah": "neutral"
  };
  return map[status] || "neutral";
}