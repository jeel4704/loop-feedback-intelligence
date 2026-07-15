export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  workspaceId: string;
}

