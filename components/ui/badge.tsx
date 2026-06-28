import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?:
    | "blue"
    | "indigo"
    | "slate"
    | "green"
    | "amber"
    | "rose"
    | "outline";
}

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100",
  outline:
    "bg-white text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700"
};

export function Badge({
  children,
  className,
  variant = "slate",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
