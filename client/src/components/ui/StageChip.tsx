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
        return { style: "bg-slate-100 text-slate-700 border-slate-200", label: "Applied", dotColor: "bg-slate-500" };
      case "SHORTLISTED":
        return { style: "bg-sky-50 text-sky-700 border-sky-200", label: "Shortlisted", dotColor: "bg-sky-500" };
      case "IN_INTERVIEW":
        return { style: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "In Interview", dotColor: "bg-indigo-500" };
      case "SELECTED":
      case "APPROVED":
      case "ACTIVE":
        return { style: "bg-emerald-50 text-emerald-700 border-emerald-200", label: stage === "ACTIVE" ? "Active" : stage === "APPROVED" ? "Approved" : "Selected", dotColor: "bg-emerald-500" };
      case "REJECTED":
        return { style: "bg-red-50 text-red-700 border-red-200", label: "Rejected", dotColor: "bg-red-500" };
      case "CLOSED":
        return { style: "bg-slate-100 text-slate-600 border-slate-200", label: "Closed", dotColor: "bg-slate-400" };
      case "PENDING":
      case "PENDING_APPROVAL":
        return { style: "bg-amber-50 text-amber-700 border-amber-200", label: "Pending Approval", dotColor: "bg-amber-500" };
      default:
        return { style: "bg-slate-100 text-slate-700 border-slate-200", label: stage, dotColor: "bg-slate-400" };
    }
  };

  const { style, label, dotColor } = getStyleAndLabel();
  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-medium border leading-none tracking-tight",
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
