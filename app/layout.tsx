import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppSessionProvider } from "@/providers/SessionProvider";
import { AppThemeProvider } from "@/providers/ThemeProvider";
import { NotificationProvider } from "@/hooks/useNotifications";

export const metadata: Metadata = {
  title: "LOOP AI Customer Feedback Intelligence Platform",
  description: "Multi-tenant AI platform for customer feedback intelligence."
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppThemeProvider>
          <NotificationProvider>
            <AppSessionProvider>{children}</AppSessionProvider>
          </NotificationProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
