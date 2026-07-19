import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all dark:border-dark-border dark:bg-dark-input dark:text-white dark:focus:border-brand dark:focus:ring-1 dark:focus:ring-brand dark:focus:shadow-[0_0_15px_rgba(91,92,255,0.15)]",
        props.className
      )}
    />
  );
}

