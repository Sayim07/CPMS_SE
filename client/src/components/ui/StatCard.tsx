import React from "react";
import { cn } from "../../lib/utils";
import { TiltCard } from "./TiltCard";

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
  enableTilt?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  className,
  enableTilt = true,
}) => {
  const content = (
    <div className="p-5 h-full flex flex-col justify-between text-black dark:text-white">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider text-black/70 dark:text-white/70 font-mono">{label}</p>
          {icon && (
            <div className="p-2 rounded-neo bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]">
              {icon}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-black dark:text-white font-mono">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-xs font-black px-2 py-0.5 rounded-neo border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff] font-mono",
                trend.isPositive
                  ? "bg-[#86EFAC] text-black"
                  : "bg-[#FF70A6] text-black"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
      </div>

      {subtext && <p className="mt-2 text-xs font-medium text-black/60 dark:text-white/60">{subtext}</p>}
    </div>
  );

  if (enableTilt) {
    return (
      <TiltCard className={cn("hover:border-indigo-300 transition-colors", className)}>
        {content}
      </TiltCard>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-lg border border-slate-200 shadow-sm transition-all hover:border-slate-300",
        className
      )}
    >
      {content}
    </div>
  );
};
