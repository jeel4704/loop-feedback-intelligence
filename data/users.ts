import { getInitials } from "@/lib/avatar";
import type { DemoCredential } from "@/types/auth";
import type { WorkspaceItem, WorkspaceMember } from "@/types/workspace";

export const demoWorkspace: WorkspaceItem = {
  id: "workspace_demo",
  name: "Acme Technologies",
  slug: "acme-technologies"
};

export const demoAccounts: DemoCredential[] = [
  {
    id: "user_admin",
    email: "admin@loop.com",
    password: "password123",
    name: "Alwin Geofery",
    role: "ADMIN",
    workspaceId: demoWorkspace.id,
    workspaceName: demoWorkspace.name,
    avatarInitials: getInitials("Alwin Geofery")
  },
  {
    id: "user_analyst_1",
    email: "analyst@loop.com",
    password: "password123",
    name: "Sarah Johnson",
    role: "ANALYST",
    workspaceId: demoWorkspace.id,
    workspaceName: demoWorkspace.name,
    avatarInitials: getInitials("Sarah Johnson")
  },
  {
    id: "user_viewer_1",
    email: "viewer@loop.com",
    password: "password123",
    name: "Emma Wilson",
    role: "VIEWER",
    workspaceId: demoWorkspace.id,
    workspaceName: demoWorkspace.name,
    avatarInitials: getInitials("Emma Wilson")
  }
];

export const demoMembers: WorkspaceMember[] = [
  {
    id: "user_admin",
    email: "admin@loop.com",
    name: "Alwin Geofery",
    role: "ADMIN",
    avatarInitials: getInitials("Alwin Geofery")
  },
  {
    id: "user_analyst_1",
    email: "analyst@loop.com",
    name: "Sarah Johnson",
    role: "ANALYST",
    avatarInitials: getInitials("Sarah Johnson")
  },
  {
    id: "user_analyst_2",
    email: "michael@loop.com",
    name: "Michael Brown",
    role: "ANALYST",
    avatarInitials: getInitials("Michael Brown")
  },
  {
    id: "user_viewer_1",
    email: "viewer@loop.com",
    name: "Emma Wilson",
    role: "VIEWER",
    avatarInitials: getInitials("Emma Wilson")
  },
  {
    id: "user_viewer_2",
    email: "david@loop.com",
    name: "David Miller",
    role: "VIEWER",
    avatarInitials: getInitials("David Miller")
  }
];

