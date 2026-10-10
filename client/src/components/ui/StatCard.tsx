import React from "react";
import { cn } from "../../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 p-5 shadow-sm transition-all hover:border-slate-300",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        {icon && <div className="text-slate-400 p-1.5 rounded-md bg-slate-50 border border-slate-100">{icon}</div>}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium px-1.5 py-0.5 rounded",
              trend.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
};
