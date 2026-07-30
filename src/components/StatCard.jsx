export default function StatCard({ label, value, icon: Icon, color = "neo-yellow", sublabel }) {
  const colorMap = {
    "neo-yellow": "bg-neo-yellow",
    "neo-pink": "bg-neo-pink",
    "neo-blue": "bg-neo-blue",
    "neo-green": "bg-neo-green",
    "neo-purple": "bg-neo-purple",
    "neo-black": "bg-black text-white dark:bg-white dark:text-black",
  };

  return (
    <div className="neo-card p-6 hover:translate-x-[2px] hover:translate-y-[2px] transition-transform cursor-default" style={{ transition: "transform 0.15s ease, box-shadow 0.15s ease" }}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl border-[3px] border-black dark:border-white flex items-center justify-center ${colorMap[color] || colorMap["neo-yellow"]}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-sm font-bold text-muted-foreground mt-1">{label}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}