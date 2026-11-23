import { Bell } from "lucide-react";
import { Empty } from "@/components/os/ui";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Notifications"
        description="Reminder and push notification status for the local-first Yash OS build."
        icon={Bell}
      />

      <Empty title="Push and audio reminders are not active yet">
        <p className="mx-auto mt-2 max-w-md text-xs text-muted-foreground leading-relaxed">
          Yash OS currently runs without background push notifications, audio
          timer chimes, or scheduled evening closeout alerts. No non-functional
          toggles are shown here.
        </p>
      </Empty>

      <div className="rounded-2xl border border-glass-border bg-secondary/20 p-4 text-xs text-muted-foreground leading-relaxed space-y-1.5">
        <div className="font-semibold text-foreground">
          What is active today
        </div>
        <p>
          In-app action confirmations (plan approvals, task completion, backup
          status) appear via toast feedback, and analytical Review Alerts remain
          configured inside <strong className="text-foreground">Reviews</strong>
          .
        </p>
      </div>
    </div>
  );
}
