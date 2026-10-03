import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "schedule" | "ghost" | "icon";
};

export function Button({ className, variant = "primary", children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary-hover active:translate-y-px",
        variant === "schedule" && "bg-schedule text-schedule-foreground hover:bg-schedule-hover active:translate-y-px",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-muted",
        variant === "icon" && "bg-primary text-primary-foreground hover:bg-primary-hover",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}