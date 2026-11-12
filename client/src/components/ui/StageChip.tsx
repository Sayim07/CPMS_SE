import React from "react";
import { cn } from "../../lib/utils";

export type ApplicationStage = "APPLIED" | "SHORTLISTED" | "IN_INTERVIEW" | "SELECTED" | "REJECTED";
export type JobStatus = "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "REJECTED";
export type CompanyStatus = "PENDING" | "APPROVED" | "REJECTED";

interface StageChipProps {
  stage: ApplicationStage | JobStatus | CompanyStatus | string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * Standard Status & Stage Chip conforming to Design.md §3 tokens.
 */
export const StageChip: React.FC<StageChipProps> = ({ stage, className, size = "md" }) => {
  const getStyleAndLabel = (): { style: string; label: string; dotColor: string } => {
    switch (stage) {
      // Application Stages
      case "APPLIED":
        return { style: "bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "Applied", dotColor: "bg-black dark:bg-white" };
      case "SHORTLISTED":
        return { style: "bg-[#7DD3FC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "Shortlisted", dotColor: "bg-black" };
      case "IN_INTERVIEW":
        return { style: "bg-[#A388EE] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "In Interview", dotColor: "bg-black" };
      case "SELECTED":
      case "APPROVED":
      case "ACTIVE":
        return { style: "bg-[#86EFAC] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: stage === "ACTIVE" ? "Active" : stage === "APPROVED" ? "Approved" : "Selected", dotColor: "bg-black" };
      case "REJECTED":
        return { style: "bg-[#FF70A6] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "Rejected", dotColor: "bg-black" };
      case "CLOSED":
        return { style: "bg-zinc-200 dark:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "Closed", dotColor: "bg-black dark:bg-white" };
      case "PENDING":
      case "PENDING_APPROVAL":
        return { style: "bg-[#FFE600] text-black border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: "Pending Approval", dotColor: "bg-black" };
      default:
        return { style: "bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#fff]", label: stage, dotColor: "bg-black dark:bg-white" };
    }
  };

  const { style, label, dotColor } = getStyleAndLabel();
  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-neo font-bold leading-none tracking-tight select-none uppercase text-[11px]",
        style,
        sizeStyles,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
