import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  fullWidth?: boolean;
}

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:outline-blue-600 dark:bg-gradient-to-r dark:from-brand dark:to-brand-hover dark:hover:shadow-[0_0_20px_rgba(91,92,255,0.4)] dark:hover:-translate-y-0.5 transition-all",
  secondary:
    "bg-white text-slate-900 ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus-visible:outline-slate-400 dark:bg-dark-elevated dark:text-white dark:ring-dark-border dark:hover:bg-dark-hover dark:hover:ring-brand/50 dark:hover:-translate-y-0.5 transition-all",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400 dark:text-dark-muted dark:hover:bg-dark-elevated dark:hover:text-white transition-all",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600 dark:bg-rose-600 dark:hover:bg-rose-500 dark:hover:shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all"
};

export function buttonStyles({
  variant = "primary",
  fullWidth = false,
  className
}: Pick<ButtonProps, "variant" | "fullWidth" | "className">) {
  return cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60",
    buttonVariants[variant],
    fullWidth && "w-full",
    className
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
