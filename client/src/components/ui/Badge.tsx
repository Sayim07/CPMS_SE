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
    eligible: "bg-[#86EFAC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
    mismatch: "bg-[#FF70A6] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
    warning: "bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
    info: "bg-[#7DD3FC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
    neutral: "bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]",
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
        "inline-flex items-center gap-1.5 rounded-neo font-bold leading-none select-none tracking-wider",
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
