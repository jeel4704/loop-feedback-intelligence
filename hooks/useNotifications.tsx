"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: "Today" | "Yesterday" | "Earlier";
  isRead: boolean;
  type: "import" | "analysis" | "report" | "workspace" | "user" | "integration" | "system";
}

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

const initialNotifications: NotificationItem[] = [
  // Today
  {
    id: "not_1",
    title: "243 Feedback records imported",
    description: "Successfully processed manual uploader records.",
    time: "10m ago",
    category: "Today",
    isRead: false,
    type: "import"
  },
  {
    id: "not_2",
    title: "CSV Import completed",
    description: "LOOP_Feedback_Themes_350.csv ingested.",
    time: "2h ago",
    category: "Today",
    isRead: false,
    type: "import"
  },
  {
    id: "not_3",
    title: "AI Theme Analysis finished",
    description: "Extracted 5 key customer feedback themes.",
    time: "4h ago",
    category: "Today",
    isRead: false,
    type: "analysis"
  },
  {
    id: "not_4",
    title: "Report generated",
    description: "AI Executive Summary is ready to view.",
    time: "6h ago",
    category: "Today",
    isRead: true,
    type: "report"
  },
  {
    id: "not_5",
    title: "New Workspace created",
    description: "Workspace initialized successfully.",
    time: "8h ago",
    category: "Today",
    isRead: true,
    type: "workspace"
  },
  // Yesterday
  {
    id: "not_6",
    title: "User invited successfully",
    description: "Sent magic link invitation to new team member.",
    time: "1d ago",
    category: "Yesterday",
    isRead: true,
    type: "user"
  },
  {
    id: "not_7",
    title: "Integration connected",
    description: "Slack integration setup completed.",
    time: "1d ago",
    category: "Yesterday",
    isRead: true,
    type: "integration"
  },
  {
    id: "not_8",
    title: "Scheduled report delivered",
    description: "Delivered Weekly Dashboard PDF via email.",
    time: "1d ago",
    category: "Yesterday",
    isRead: true,
    type: "report"
  },
  // Earlier
  {
    id: "not_9",
    title: "System maintenance completed",
    description: "Database upgraded to pgvector support.",
    time: "3d ago",
    category: "Earlier",
    isRead: true,
    type: "system"
  },
  {
    id: "not_10",
    title: "Workspace backup finished",
    description: "Encrypted offline snapshot stored successfully.",
    time: "5d ago",
    category: "Earlier",
    isRead: true,
    type: "system"
  }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
