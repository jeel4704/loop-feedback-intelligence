import type { Role } from "@/types/auth";

export interface WorkspaceMember {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
}

export interface WorkspaceItem {
  id: string;
  name: string;
  slug: string;
}

