import { DataTable } from "@/components/tables";
import { Avatar } from "@/components/common";
import { demoMembers } from "@/data/users";
import { Badge, Button, SectionHeader } from "@/components/ui";

const roleVariant = {
  ADMIN: "blue",
  ANALYST: "indigo",
  VIEWER: "slate"
} as const;

export default function MembersPage() {
  const rows = demoMembers.map((member) => [
    <div key={`${member.email}-identity`}>
      <div className="flex items-center gap-3">
        <Avatar initials={member.avatarInitials} name={member.name} />
        <div>
          <p className="font-medium text-slate-900 dark:text-slate-100">
            {member.name}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {member.email}
          </p>
        </div>
      </div>
    </div>,
    <Badge
      key={`${member.email}-role`}
      variant={roleVariant[member.role]}
      className="w-fit"
    >
      {member.role}
    </Badge>,
    <span
      key={`${member.email}-scope`}
      className="text-sm text-slate-600 dark:text-slate-300"
    >
      Acme Technologies workspace
    </span>
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Workspace Access"
        title="Manage members and roles"
        description="Invite teammates into the workspace and maintain role-based access for Admin, Analyst, and Viewer users."
        action={<Button>Add member</Button>}
      />

      <DataTable
        columns={[
          { key: "member", label: "Member" },
          { key: "role", label: "Role" },
          { key: "scope", label: "Workspace Scope" }
        ]}
        rows={rows}
      />
    </div>
  );
}
