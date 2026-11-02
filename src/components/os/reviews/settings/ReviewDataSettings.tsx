import React from "react";
import { Download, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/os/ui";
import { toast } from "sonner";
import type { ReviewsBackupPayload } from "./reviewSettingsConstants";

interface ReviewDataSettingsProps {
  onExportBackup: () => void;
  onRestoreBackup: (parsed: ReviewsBackupPayload) => void;
  onLoadDemoFixtures: () => void;
}

export function ReviewDataSettings({
  onExportBackup,
  onRestoreBackup,
  onLoadDemoFixtures,
}: ReviewDataSettingsProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(
          evt.target?.result as string,
        ) as ReviewsBackupPayload;
        if (!parsed || !Array.isArray(parsed.history)) {
          toast.error("Invalid backup file: missing history records.");
          return;
        }
        onRestoreBackup(parsed);
      } catch {
        toast.error("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-3">
        <div className="font-semibold text-foreground text-sm">
          Full Reviews Backup & Restore
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Exports or restores all closed day records, task snapshots, audit
          logs, bottlenecks, and improvement records into a portable JSON file.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" size="sm" onClick={onExportBackup}>
            <Download className="h-3.5 w-3.5 mr-1" /> Download JSON Backup
          </Button>

          <label className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-xl glass hover:bg-accent text-foreground cursor-pointer transition-all">
            <Upload className="h-3.5 w-3.5 mr-1" /> Restore Backup
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-glass-border bg-secondary/30 p-4 space-y-3">
        <div className="font-semibold text-foreground text-sm">
          Demonstration Dataset
        </div>
        <p className="text-muted-foreground leading-relaxed">
          Merge 14 days of realistic review records (covering Cashflow sessions,
          Stripe migrations, auth flows, audit corrections, and bottlenecks) for
          benchmarking.
        </p>
        <Button variant="glass" size="sm" onClick={onLoadDemoFixtures}>
          <Sparkles className="h-3.5 w-3.5 mr-1 text-cyan" /> Load 14-Day Demo
          Records
        </Button>
      </div>
    </div>
  );
}
