import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed border-slate-200 bg-white",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <FolderOpen className="w-5 h-5" />}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
