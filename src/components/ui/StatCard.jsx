import React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({ title, value, icon: Icon, trend, trendUp, color = "primary", subtitle }) {
  const colorMap = {
    primary: "from-primary/10 to-primary/5 text-primary",
    secondary: "from-secondary/10 to-secondary/5 text-secondary",
    orange: "from-orange-500/10 to-orange-500/5 text-orange-500",
    purple: "from-purple-500/10 to-purple-500/5 text-purple-500",
    cyan: "from-cyan-500/10 to-cyan-500/5 text-cyan-500",
    red: "from-red-500/10 to-red-500/5 text-red-500"
  };

  return (
    <div className="glass-card p-5 hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", colorMap[color])}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
            trendUp ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"
          )}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold font-heading text-foreground tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}