import { useEffect, useState } from "react";
import { Cpu, Database, Lock, Server, ShieldCheck } from "lucide-react";
import { APP_VERSION, collectStorageDiagnostics } from "@/lib/os/settings";
import { useOS } from "@/lib/os/store";
import { SettingsSectionHeader } from "./SettingsSectionHeader";

export function SystemPrivacySettings() {
  const { state } = useOS();
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

  const stats = [
    {
      label: "Application",
      value: "Yash OS",
      sub: "Local-first build",
      icon: Cpu,
    },
    {
      label: "App Version",
      value: `v${APP_VERSION}`,
      sub: "package.json manifest",
      icon: Server,
    },
    {
      label: "Schema Version",
      value: `v${diagnostics.schemaVersion}`,
      sub: "Automatic state migration",
      icon: Database,
    },
    {
      label: "Storage Used",
      value: `~${diagnostics.totalKb} KB`,
      sub: "Primary + P3 stores",
      icon: Lock,
    },
  ];

  return (
    <div className="space-y-6">
      <SettingsSectionHeader
        title="System & Privacy"
        description="Runtime diagnostics, active schema versioning, and honest client-side privacy boundaries."
        icon={ShieldCheck}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-glass-border bg-secondary/25 p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-1 text-base font-bold text-foreground sm:text-lg">
              {value}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {sub}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-glass-border bg-secondary/20 p-5 text-xs text-muted-foreground leading-relaxed">
        <div className="font-semibold text-foreground">
          Client-Side Data & Security Boundaries
        </div>
        <p>
          <strong className="text-foreground">Local-Only Storage:</strong>{" "}
          Application state stays on your device in browser{" "}
          <code className="rounded bg-secondary/60 px-1 py-0.5 font-mono text-[11px] text-foreground">
            localStorage
          </code>{" "}
          ({diagnostics.primaryStorageKey} and {diagnostics.p3StorageKey}).
          There is no remote database, telemetry tracking, or cloud sync
          running.
        </p>
        <p>
          <strong className="text-foreground">Browser Storage Caveat:</strong>{" "}
          Browser <code className="font-mono text-[11px]">localStorage</code> is
          unencrypted on disk and scoped per browser profile (~5 MB quota).
          Download JSON backups in Data & Storage before clearing site data.
        </p>
        <p>
          <strong className="text-foreground">Financial Isolation:</strong>{" "}
          Priority 2 financial balances and trading PnL remain excluded from
          Settings diagnostics and Global Knowledge graph projections.
        </p>
      </div>
    </div>
  );
}
