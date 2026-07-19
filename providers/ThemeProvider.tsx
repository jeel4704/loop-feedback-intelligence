"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

// Theme provider wrapper for future light and dark mode support.
export function AppThemeProvider({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}

