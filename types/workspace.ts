import type { Role } from "@/types/auth";

export interface WorkspaceMember {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarInitials: string;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}
