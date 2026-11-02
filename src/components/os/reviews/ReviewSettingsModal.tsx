import { useState, useMemo } from "react";
import { useOS } from "@/lib/os/store";
import {
  addCustomMetric,
  deleteCustomMetric,
  deleteCustomView,
  saveCustomView,
  updateAlertSettings,
  updateReflectionTemplates,
  updateReviewSettings,
} from "@/lib/os/reviews/operations";
import { calculatePeriodSummary } from "@/lib/os/reviews/analytics";
import {
  demoReviewDays,
  defaultReviewSettings,
} from "@/lib/os/reviews/fixtures";
import type {
  AlertSettings,
  CustomMetricDefinition,
  CustomReviewView,
  ReflectionTemplate,
  ReviewSettings,
} from "@/lib/os/types";
import { Button, Modal } from "@/components/os/ui";
import { toast } from "sonner";
import {
  ReviewGeneralSettings,
  ReviewSavedViewsSettings,
  ReviewCustomMetricsSettings,
  ReviewQuestionsSettings,
  ReviewAlertsSettings,
  ReviewDataSettings,
} from "./settings";
import {
  ALL_CARDS,
  type ReviewsBackupPayload,
} from "./settings/reviewSettingsConstants";

export { ALL_CARDS };

interface ReviewSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ReviewSettingsModal({
  open,
  onClose,
}: ReviewSettingsModalProps) {
  const { state, update } = useOS();

  const settings: ReviewSettings =
    state.reviewSettings ?? defaultReviewSettings;

  const [activeTab, setActiveTab] = useState<
    "general" | "views" | "metrics" | "questions" | "alerts" | "data"
  >("general");

  const activeTemplates: ReflectionTemplate =
    settings.reflectionTemplates ?? defaultReviewSettings.reflectionTemplates!;

  const alertSettings: AlertSettings =
    settings.alertSettings ?? defaultReviewSettings.alertSettings!;

  // Trailing summary for live test preview of custom metrics
  const trailing14Summary = useMemo(() => {
    const end = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10);
    return calculatePeriodSummary(
      state.history,
      "custom",
      "trailing-14",
      start,
      end,
    );
  }, [state.history]);

  const handleUpdateSettings = (patch: Partial<ReviewSettings>) => {
    update((s) => updateReviewSettings(s, patch));
    toast.success("Settings updated.");
  };

  const handleSaveView = (newView: CustomReviewView) => {
    update((s) => saveCustomView(s, newView));
  };

  const handleDeleteView = (viewId: string) => {
    update((s) => deleteCustomView(s, viewId));
  };

  const handleAddMetric = (newMetric: CustomMetricDefinition) => {
    update((s) => addCustomMetric(s, newMetric));
  };

  const handleDeleteMetric = (metricId: string) => {
    update((s) => deleteCustomMetric(s, metricId));
  };

  const handleUpdateTemplates = (templates: ReflectionTemplate) => {
    update((s) => updateReflectionTemplates(s, templates));
  };

  const handleResetTemplates = () => {
    update((s) =>
      updateReflectionTemplates(s, defaultReviewSettings.reflectionTemplates!),
    );
  };

  const handleUpdateAlerts = (alerts: AlertSettings) => {
    update((s) => updateAlertSettings(s, alerts));
  };

  const handleExportFullBackup = () => {
    const payload = {
      schemaVersion: "2.0",
      timestamp: new Date().toISOString(),
      history: state.history,
      bottlenecks: state.bottlenecks ?? [],
      improvements: state.improvements ?? [],
      periodReviews: state.periodReviews ?? [],
      forecastHistory: state.forecastHistory ?? [],
      reviewSettings: settings,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `yash-os-reviews-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    toast.success("Reviews backup downloaded.");
  };

  const handleRestoreBackup = (parsed: ReviewsBackupPayload) => {
    update((s) => ({
      ...s,
      history: parsed.history ?? s.history,
      bottlenecks: parsed.bottlenecks || s.bottlenecks,
      improvements: parsed.improvements || s.improvements,
      periodReviews: parsed.periodReviews || s.periodReviews,
      forecastHistory: parsed.forecastHistory || s.forecastHistory,
      reviewSettings: parsed.reviewSettings || s.reviewSettings,
    }));
    toast.success(
      `Successfully restored ${parsed.history?.length ?? 0} review records.`,
    );
    onClose();
  };

  const handleLoadDemoFixtures = () => {
    if (
      confirm(
        "Load 14 days of realistic demonstration review records? Your existing history will be merged safely.",
      )
    ) {
      const existingDates = new Set(state.history.map((h) => h.date));
      const newFixtures = demoReviewDays.filter(
        (d) => !existingDates.has(d.date),
      );

      update((s) => ({
        ...s,
        history: [...newFixtures, ...s.history].sort((a, b) =>
          b.date.localeCompare(a.date),
        ),
      }));

      toast.success(
        `Loaded ${newFixtures.length} demonstration review day records.`,
      );
      onClose();
    }
  };

  if (!open) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Reviews Configuration & Customization"
      wide
    >
      <div className="space-y-5 text-xs">
        {/* Navigation Tabs */}
        <div className="flex border-b border-glass-border pb-2 gap-1.5 overflow-x-auto">
          <Button
            variant={activeTab === "general" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("general")}
            className="text-xs shrink-0"
          >
            General
          </Button>
          <Button
            variant={activeTab === "views" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("views")}
            className="text-xs shrink-0"
          >
            Layouts & Views ({settings.customViews?.length ?? 0})
          </Button>
          <Button
            variant={activeTab === "metrics" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("metrics")}
            className="text-xs shrink-0"
          >
            Custom Metrics ({settings.customMetrics?.length ?? 0})
          </Button>
          <Button
            variant={activeTab === "questions" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("questions")}
            className="text-xs shrink-0"
          >
            Reflection Prompts
          </Button>
          <Button
            variant={activeTab === "alerts" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("alerts")}
            className="text-xs shrink-0"
          >
            Alert Controls
          </Button>
          <Button
            variant={activeTab === "data" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("data")}
            className="text-xs shrink-0"
          >
            Data & Backup
          </Button>
        </div>

        {/* Tab 1: General Preferences */}
        {activeTab === "general" && (
          <ReviewGeneralSettings
            settings={settings}
            onUpdate={handleUpdateSettings}
          />
        )}

        {/* Tab 2: Dashboard Layouts & Views */}
        {activeTab === "views" && (
          <ReviewSavedViewsSettings
            customViews={settings.customViews}
            onSaveView={handleSaveView}
            onDeleteView={handleDeleteView}
          />
        )}

        {/* Tab 3: Custom Metric Formula Builder */}
        {activeTab === "metrics" && (
          <ReviewCustomMetricsSettings
            customMetrics={settings.customMetrics}
            trailing14Summary={trailing14Summary}
            onAddMetric={handleAddMetric}
            onDeleteMetric={handleDeleteMetric}
          />
        )}

        {/* Tab 4: Reflection Prompts */}
        {activeTab === "questions" && (
          <ReviewQuestionsSettings
            templates={activeTemplates}
            onUpdateTemplates={handleUpdateTemplates}
            onResetTemplates={handleResetTemplates}
          />
        )}

        {/* Tab 5: Alert Controls */}
        {activeTab === "alerts" && (
          <ReviewAlertsSettings
            alertSettings={alertSettings}
            onUpdateAlerts={handleUpdateAlerts}
          />
        )}

        {/* Tab 6: Data & Backup */}
        {activeTab === "data" && (
          <ReviewDataSettings
            onExportBackup={handleExportFullBackup}
            onRestoreBackup={handleRestoreBackup}
            onLoadDemoFixtures={handleLoadDemoFixtures}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </Modal>
  );
}
