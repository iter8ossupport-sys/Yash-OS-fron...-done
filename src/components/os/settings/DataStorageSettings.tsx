import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Download,
  HardDrive,
  RotateCcw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  applyValidatedRestore,
  buildBackupExport,
  buildFactoryResetState,
  collectStorageDiagnostics,
  validateBackupJson,
  type BackupSummary,
} from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import { Button, Modal } from "@/components/os/ui";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

interface PendingRestore {
  payload: Record<string, unknown>;
  summary: BackupSummary;
  fileName: string;
}

export function DataStorageSettings() {
  const { state, update } = useOS();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<PendingRestore | null>(
    null,
  );
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const rawDiagnostics = collectStorageDiagnostics(state);
  const diagnostics = hydrated
    ? rawDiagnostics
    : {
        ...rawDiagnostics,
        primaryKb: 0,
        p3Kb: 0,
        totalKb: 0,
        p3KnowledgeUnitsCount: 0,
      };

  const exportData = () => {
    const json = buildBackupExport(state);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `yash-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      toast.success("Backup downloaded");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const readFileText = (file: File): Promise<string> => {
    if (typeof file.text === "function") {
      return file.text();
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error ?? new Error("Read failed"));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const rawText = await readFileText(file);
      e.target.value = "";
      const validation = validateBackupJson(rawText);
      if (!validation.valid) {
        setRestoreError(validation.error);
        toast.error(validation.error);
        return;
      }
      setRestoreError(null);
      setPendingRestore({
        payload: validation.value.payload,
        summary: validation.value.summary,
        fileName: file.name,
      });
    } catch {
      e.target.value = "";
      const msg = "Could not read backup file.";
      setRestoreError(msg);
      toast.error(msg);
    }
  };

  const confirmRestore = () => {
    if (!pendingRestore) return;
    const payload = pendingRestore.payload;
    update(() => applyValidatedRestore(payload));
    setPendingRestore(null);
    setRestoreError(null);
    toast.success("Backup validated and restored");
  };

  const handleResetData = () => {
    update(() => buildFactoryResetState());
    setIsResetConfirmOpen(false);
    setRestoreError(null);
    toast.success("Primary OS data reset to v5 defaults");
  };

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="Data & Storage"
        description="Monitor local storage usage, export JSON snapshots, validate restores, and manage recovery."
        icon={HardDrive}
      />

      {/* Storage Status (Non-Sensitive Structural Counts Only) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-glass-border bg-secondary/25 p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Primary Store
          </div>
          <div className="mt-1 text-base font-bold text-foreground">
            {diagnostics.primaryKb} KB
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {diagnostics.projectCount} projects · {diagnostics.historyDaysCount}{" "}
            days
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-secondary/25 p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Priority 3 Store
          </div>
          <div className="mt-1 text-base font-bold text-foreground">
            {diagnostics.p3Kb} KB
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {diagnostics.p3KnowledgeUnitsCount} P3 units
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-secondary/25 p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Curated Memory
          </div>
          <div className="mt-1 text-base font-bold text-foreground">
            {diagnostics.knowledgeItemsCount}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Knowledge items
          </div>
        </div>

        <div className="rounded-xl border border-glass-border bg-secondary/25 p-3.5">
          <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Combined Size
          </div>
          <div className="mt-1 text-base font-bold text-foreground">
            {diagnostics.totalKb} KB
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            Schema v{diagnostics.schemaVersion}
          </div>
        </div>
      </div>

      {/* Backup & Restore Controls */}
      <div className="space-y-3 rounded-2xl border border-glass-border bg-secondary/20 p-5">
        <div>
          <div className="text-sm font-semibold text-foreground">
            Backup & Restore ({diagnostics.primaryStorageKey})
          </div>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Exports and restores your primary Yash OS state (settings, plans,
            projects, curated knowledge, and review history). Restores are
            validated and previewed before replacing current state.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button onClick={exportData} variant="primary">
            <Download className="h-4 w-4" />
            Export Backup (JSON)
          </Button>

          <label className="inline-flex">
            <input
              type="file"
              aria-label="Import backup file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleFileChange}
            />
            <span className="glass inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl px-4 text-sm font-medium transition hover:bg-accent">
              <Upload className="h-4 w-4" />
              Import Backup
            </span>
          </label>

          <Button variant="danger" onClick={() => setIsResetConfirmOpen(true)}>
            <RotateCcw className="h-4 w-4" />
            Reset Data
          </Button>
        </div>

        {restoreError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}
      </div>

      {/* Recovery & Storage Ownership Info */}
      <div className="rounded-2xl border border-glass-border bg-secondary/20 p-4 text-xs text-muted-foreground leading-relaxed space-y-1.5">
        <div className="font-semibold text-foreground">
          Storage Boundaries & Recovery
        </div>
        <p>
          Primary OS records live in{" "}
          <code className="rounded bg-secondary/60 px-1 py-0.5 font-mono text-[11px] text-foreground">
            {diagnostics.primaryStorageKey}
          </code>
          . Priority 3 Knowledge Units maintain their own isolated repository in{" "}
          <code className="rounded bg-secondary/60 px-1 py-0.5 font-mono text-[11px] text-foreground">
            {diagnostics.p3StorageKey}
          </code>{" "}
          with internal backup snapshots and are not overwritten by a primary
          factory reset.
        </p>
      </div>

      {/* Restore Confirmation Modal */}
      {pendingRestore && (
        <Modal
          open={Boolean(pendingRestore)}
          title="Confirm Backup Restore?"
          onClose={() => setPendingRestore(null)}
          className="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Validated{" "}
              <strong className="text-foreground">
                {pendingRestore.fileName}
              </strong>
              . Restoring will replace your current primary OS data with this
              snapshot:
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-glass-border bg-secondary/30 p-3 text-xs">
              <div>
                <span className="text-muted-foreground">Profile:</span>{" "}
                <strong className="text-foreground">
                  {pendingRestore.summary.userName}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Schema:</span>{" "}
                <strong className="text-foreground">
                  v{pendingRestore.summary.schemaVersion}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">Projects:</span>{" "}
                <strong className="text-foreground">
                  {pendingRestore.summary.projectCount}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">History Days:</span>{" "}
                <strong className="text-foreground">
                  {pendingRestore.summary.historyCount}
                </strong>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="glass" onClick={() => setPendingRestore(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmRestore}>
                Confirm Restore
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <Modal
          open={isResetConfirmOpen}
          title="Reset All Primary OS Data?"
          onClose={() => setIsResetConfirmOpen(false)}
          className="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              This will reset active plans, projects, curated knowledge, review
              history, and settings back to factory defaults.
            </p>
            <p className="text-xs font-medium text-destructive">
              Export a JSON backup before proceeding if you want to keep a copy.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="glass"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleResetData}>
                Yes, Reset Everything
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
