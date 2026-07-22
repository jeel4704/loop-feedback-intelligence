import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
}

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-950 dark:text-slate-50">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">{hint}</span> : null}
    </label>
  );
}

