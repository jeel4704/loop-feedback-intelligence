import type { ThemeItem } from "@/types/theme";
import { demoWorkspace } from "@/data/users";

export const demoThemes: ThemeItem[] = [
  {
    id: "theme_onboarding",
    workspaceId: demoWorkspace.id,
    name: "Onboarding",
    description: "Customer reactions to setup, activation, and first-use flows.",
    featureArea: "Activation"
  },
  {
    id: "theme_billing",
    workspaceId: demoWorkspace.id,
    name: "Billing",
    description: "Pricing clarity, invoices, plan changes, and payment issues.",
    featureArea: "Revenue"
  },
  {
    id: "theme_mobile-app",
    workspaceId: demoWorkspace.id,
    name: "Mobile App",
    description: "Stability and usability feedback for mobile product experiences.",
    featureArea: "Mobile"
  },
  {
    id: "theme_dashboard",
    workspaceId: demoWorkspace.id,
    name: "Dashboard",
    description: "Usability and performance of dashboards and analytics surfaces.",
    featureArea: "Analytics"
  },
  {
    id: "theme_notifications",
    workspaceId: demoWorkspace.id,
    name: "Notifications",
    description: "Signal quality, frequency, and delivery of alerts and reminders.",
    featureArea: "Engagement"
  },
  {
    id: "theme_performance",
    workspaceId: demoWorkspace.id,
    name: "Performance",
    description: "Product speed, loading time, and perceived responsiveness.",
    featureArea: "Platform"
  },
  {
    id: "theme_authentication",
    workspaceId: demoWorkspace.id,
    name: "Authentication",
    description: "Login, SSO, password reset, and access friction.",
    featureArea: "Security"
  },
  {
    id: "theme_api",
    workspaceId: demoWorkspace.id,
    name: "API",
    description: "Developer feedback on API reliability, docs, and rate limits.",
    featureArea: "Developer Platform"
  },
  {
    id: "theme_export",
    workspaceId: demoWorkspace.id,
    name: "Export",
    description: "CSV, PDF, and data export completeness and formatting.",
    featureArea: "Reporting"
  },
  {
    id: "theme_integrations",
    workspaceId: demoWorkspace.id,
    name: "Integrations",
    description: "Connected tools, sync issues, and setup friction across systems.",
    featureArea: "Ecosystem"
  },
  {
    id: "theme_reports",
    workspaceId: demoWorkspace.id,
    name: "Reports",
    description: "Voice of Customer reporting workflows, sharing, and automation.",
    featureArea: "Reporting"
  },
  {
    id: "theme_search",
    workspaceId: demoWorkspace.id,
    name: "Search",
    description: "Findability of feedback, themes, and saved insights.",
    featureArea: "Discovery"
  }
];

