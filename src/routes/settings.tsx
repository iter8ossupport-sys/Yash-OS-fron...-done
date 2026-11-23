import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Glass, PageHeader } from "@/components/os/ui";
import {
  SETTINGS_CATEGORIES,
  type SettingsCategory,
} from "@/components/os/settings/types";
import { ProfileSettings } from "@/components/os/settings/ProfileSettings";
import { AppearanceSettings } from "@/components/os/settings/AppearanceSettings";
import { WorkspaceSettings } from "@/components/os/settings/WorkspaceSettings";
import { DailyPreferencesSettings } from "@/components/os/settings/DailyPreferencesSettings";
import { NotificationSettings } from "@/components/os/settings/NotificationSettings";
import { DataStorageSettings } from "@/components/os/settings/DataStorageSettings";
import { SystemPrivacySettings } from "@/components/os/settings/SystemPrivacySettings";

type SettingsSearch = {
  section?: string | undefined;
};

const VALID_CATEGORIES: readonly SettingsCategory[] = [
  "profile",
  "appearance",
  "workspace",
  "daily",
  "notifications",
  "data",
  "system",
];

function normalizeSectionParam(raw: unknown): SettingsCategory | undefined {
  if (typeof raw !== "string") return undefined;
  if (raw === "navigation") return "daily";
  if (raw === "privacy") return "system";
  return VALID_CATEGORIES.includes(raw as SettingsCategory)
    ? (raw as SettingsCategory)
    : undefined;
}

export const Route = createFileRoute("/settings")({
  validateSearch: (s: Record<string, unknown>): SettingsSearch => ({
    section: normalizeSectionParam(s["section"]),
  }),
  head: () => ({
    meta: [
      { title: "Settings — Yash OS" },
      {
        name: "description",
        content:
          "Configure Profile, Appearance, Workspace, Daily Preferences, Notifications, Data & Storage, and System & Privacy.",
      },
      { property: "og:title", content: "Settings — Yash OS" },
      {
        property: "og:description",
        content: "Configure your Founder Operating System.",
      },
    ],
  }),
  component: SettingsPage,
});

function renderSection(category: SettingsCategory) {
  switch (category) {
    case "profile":
      return <ProfileSettings />;
    case "appearance":
      return <AppearanceSettings />;
    case "workspace":
      return <WorkspaceSettings />;
    case "daily":
      return <DailyPreferencesSettings />;
    case "notifications":
      return <NotificationSettings />;
    case "data":
      return <DataStorageSettings />;
    case "system":
      return <SystemPrivacySettings />;
    default:
      return <ProfileSettings />;
  }
}

function SettingsPage() {
  const search = Route.useSearch();
  const nav = useNavigate();

  const activeCategory: SettingsCategory =
    normalizeSectionParam(search.section) || "profile";
  const isMobileSectionOpen = Boolean(search.section);

  const handleSelectCategory = (catId: SettingsCategory) => {
    nav({
      to: "/settings",
      search: { section: catId },
      replace: true,
    });
  };

  const handleBackToMobileList = () => {
    nav({
      to: "/settings",
      search: {},
      replace: true,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Mobile Back Navigation Header */}
      {isMobileSectionOpen && (
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMobileList}
            className="-ml-2 mb-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            All Settings Categories
          </Button>
        </div>
      )}

      {/* Main Page Header */}
      <div className={cn(isMobileSectionOpen && "hidden md:block")}>
        <PageHeader
          eyebrow="System"
          title="Settings"
          subtitle="Manage your personal identity, appearance, workspace defaults, daily preferences, and storage."
        />
      </div>

      {/* Two-Panel Layout on Desktop, Drill-down on Mobile */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Left Navigation Panel (Category List) */}
        <div
          className={cn(
            "w-full md:w-72 md:shrink-0",
            isMobileSectionOpen ? "hidden md:block" : "block",
          )}
        >
          <Glass className="p-3 md:sticky md:top-24 md:p-4">
            <div className="mb-2.5 px-3 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Settings Sections
              </span>
            </div>

            <nav aria-label="Settings Categories" className="space-y-1">
              {SETTINGS_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => handleSelectCategory(cat.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                      isActive
                        ? "bg-gradient-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                          isActive
                            ? "border-white/20 bg-white/10 text-primary-foreground"
                            : "border-glass-border/40 bg-secondary/40 text-muted-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="block truncate text-sm leading-tight">
                          {cat.label}
                        </span>
                        <span
                          className={cn(
                            "block truncate text-[11px]",
                            isActive
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground/75",
                          )}
                        >
                          {cat.shortDesc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        isActive
                          ? "text-primary-foreground"
                          : "text-muted-foreground/50 md:hidden",
                      )}
                    />
                  </button>
                );
              })}
            </nav>
          </Glass>
        </div>

        {/* Right Content Panel (Active Section) */}
        <div
          className={cn(
            "flex-1 min-w-0",
            isMobileSectionOpen ? "block" : "hidden md:block",
          )}
        >
          <Glass className="p-6 md:p-8">{renderSection(activeCategory)}</Glass>
        </div>
      </div>
    </div>
  );
}
