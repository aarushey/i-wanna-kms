import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  accentColor?: "blue" | "orange" | "gray" | "emerald";
}

export default function MetricCard({
  label,
  value,
  subValue,
  icon: Icon,
  accentColor = "blue",
}: MetricCardProps) {
  const colorStyles = {
    blue: {
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      accentBar: "border-l-blue-600",
    },
    orange: {
      iconBg: "bg-orange-50 text-orange-600 border-orange-200",
      accentBar: "border-l-orange-500",
    },
    emerald: {
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      accentBar: "border-l-emerald-600",
    },
    gray: {
      iconBg: "bg-gray-100 text-gray-700 border-gray-200",
      accentBar: "border-l-gray-400",
    },
  }[accentColor];

  return (
    <div
      className={`bg-white border border-gray-200 rounded p-4 flex items-start justify-between shadow-xs border-l-4 ${colorStyles.accentBar}`}
    >
      <div>
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider font-mono">
          {label}
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums tracking-tight">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            {subValue}
          </p>
        )}
      </div>
      <div className={`p-2 rounded border ${colorStyles.iconBg}`}>
        <Icon className="w-5 h-5 shrink-0" />
      </div>
    </div>
  );
}
