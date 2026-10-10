import React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, children, disabled, ...props }, ref) => {
    const variantStyles = {
      primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border border-transparent",
      secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm",
      destructive: "bg-red-600 hover:bg-red-700 text-white shadow-sm border border-transparent",
      ghost: "hover:bg-slate-100 text-slate-700 border border-transparent",
      outline: "bg-transparent hover:bg-slate-50 text-indigo-600 border border-indigo-200",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
      md: "h-9 px-4 text-sm gap-2 rounded-md",
      lg: "h-11 px-6 text-base gap-2.5 rounded-lg",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
          "active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
