import { AlertTriangle } from "lucide-react";
import { FormField } from "@/components/forms";
import { Badge, Button, Card, CardContent, Input, SectionHeader } from "@/components/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Settings"
        title="Configure workspace and profile details"
        description="Prepare the workspace for future authentication, API integrations, and tenant-aware settings."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Workspace Settings
            </h2>
            <form className="mt-6 space-y-5">
              <FormField label="Workspace name">
                <Input defaultValue="Acme Technologies" />
              </FormField>
              <FormField label="Workspace slug">
                <Input defaultValue="acme-technologies" />
              </FormField>
              <Button type="submit">Save workspace</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Profile Settings
            </h2>
            <form className="mt-6 space-y-5">
              <FormField label="Full name">
                <Input defaultValue="Ariana Rao" />
              </FormField>
              <FormField label="Email">
                <Input defaultValue="admin@loop.com" />
              </FormField>
              <Button type="submit" variant="secondary">
                Update profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border-amber-200 bg-amber-50/70">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-slate-950">
                API key warning
              </h3>
              <Badge variant="amber">Do not commit secrets</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              Keep Auth.js, database, and Claude API keys in local environment
              files or your deployment provider. Secrets should never live in
              committed source files.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
