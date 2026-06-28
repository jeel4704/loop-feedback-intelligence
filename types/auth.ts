export type Role = "ADMIN" | "ANALYST" | "VIEWER";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  workspaceId: string;
  workspaceName: string;
  avatarInitials: string;
}

export interface DemoCredential extends AuthUser {
  password: string;
}
