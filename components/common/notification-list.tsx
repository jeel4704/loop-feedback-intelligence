import { demoNotifications } from "@/data/notifications";
import { Badge, Card, CardContent } from "@/components/ui";

export function NotificationList() {
  return (
    <Card className="dark:border-slate-800 dark:bg-slate-950/80">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              Notifications
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Signals and workspace updates for the demo environment.
            </p>
          </div>
          <Badge variant="indigo">{demoNotifications.length} live</Badge>
        </div>
        <div className="mt-5 space-y-3">
          {demoNotifications.map((notification) => (
            <div
              key={notification.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {notification.title}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {notification.time}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {notification.detail}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

