import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Info, MinusCircle } from "lucide-react";
import { cn } from "../../lib/utils";

export type BadgeVariant = "eligible" | "mismatch" | "warning" | "info" | "neutral";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: boolean | React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Standard semantic badge conforming to Design.md §3 and cpms-design-taste.
 * Pairs clear text with a Lucide icon for accessibility.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = "neutral",
  children,
  icon = true,
  className,
  size = "md",
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    eligible: "bg-emerald-50 text-emerald-700 border-emerald-200",
    mismatch: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const defaultIcons: Record<BadgeVariant, React.ReactNode> = {
    eligible: <CheckCircle2 className="w-3.5 h-3.5" />,
    mismatch: <XCircle className="w-3.5 h-3.5" />,
    warning: <AlertCircle className="w-3.5 h-3.5" />,
    info: <Info className="w-3.5 h-3.5" />,
    neutral: <MinusCircle className="w-3.5 h-3.5" />,
  };

  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium border leading-none",
        variantStyles[variant],
        sizeStyles,
        className
      )}
    >
      {icon === true ? defaultIcons[variant] : icon}
      <span>{children}</span>
    </span>
  );
};
