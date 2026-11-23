import { syncPrioritiesWithProjects } from "@/lib/os/logic";
import { defaultReviewSettings } from "@/lib/os/reviews/fixtures";
import {
  CURRENT_SCHEMA_VERSION,
  migrateOSState,
} from "@/lib/os/reviews/migrations";
import { initialState } from "@/lib/os/seed";
import type { OSState } from "@/lib/os/types";
import { createDefaultP3Storage } from "@/priority3/infrastructure/persistence/storageEngine";
import {
  P3_SCHEMA_VERSION,
  type P3StorageSchema,
} from "@/priority3/infrastructure/persistence/types";
import {
  P3_ACTIVE_INQUIRY_PREFIX,
  P3_STORAGE_KEY,
  PRIMARY_STORAGE_KEY,
  type AppearanceSettingsData,
  type DailyPreferencesData,
  type NotificationSettingsData,
  type ProfileSettingsData,
  type SettingsMutationResult,
  type StorageDiagnostics,
  type WorkspaceSettingsData,
} from "./types";
import {
  DEFAULT_TIMEZONE,
  isValidTimeZone,
  validateBackupJson,
  validateConstraints,
  validateDayType,
  validateDayTypeHoursMap,
  validateFoundation,
  validateReviewPeriod,
  validateTheme,
  validateTimeZone,
  validateUserName,
  validateWeekStartDay,
} from "./validation";

export function selectProfileSettings(state: OSState): ProfileSettingsData {
  return {
    userName: state.userName,
    userAvatar: state.userAvatar ?? null,
  };
}

export function selectAppearanceSettings(
  state: OSState,
): AppearanceSettingsData {
  return {
    theme: state.theme,
  };
}

export function selectWorkspaceSettings(state: OSState): WorkspaceSettingsData {
  return {
    foundation: state.foundation,
    defaultReviewPeriod:
      state.reviewSettings?.defaultPeriod ??
      defaultReviewSettings.defaultPeriod,
  };
}

export function selectDailyPreferences(state: OSState): DailyPreferencesData {
  const fallbackDayType =
    initialState.prefs.defaultDayType ?? "Non-College Day";
  const defaultDayType =
    state.prefs.defaultDayType &&
    state.prefs.dayTypeHours[state.prefs.defaultDayType] !== undefined
      ? state.prefs.defaultDayType
      : fallbackDayType;

  return {
    timeZone:
      state.prefs.timeZone && isValidTimeZone(state.prefs.timeZone)
        ? state.prefs.timeZone
        : DEFAULT_TIMEZONE,
    weekStartDay: state.reviewSettings?.weekStartDay ?? 1,
    defaultDayType,
    dayTypeHours: {
      ...initialState.prefs.dayTypeHours,
      ...state.prefs.dayTypeHours,
    },
    timer: Boolean(state.prefs.timer),
    constraints: state.prefs.constraints ?? "",
  };
}

export function selectNotificationSettings(): NotificationSettingsData {
  return {
    supported: false,
    browserAlertsEnabled: false,
  };
}

export function applyProfileUpdate(
  state: OSState,
  patch: Partial<ProfileSettingsData>,
): SettingsMutationResult {
  let nextUserName = state.userName;
  if (patch.userName !== undefined) {
    const nameCheck = validateUserName(patch.userName);
    if (!nameCheck.valid) {
      return { ok: false, error: nameCheck.error };
    }
    nextUserName = nameCheck.value;
  }

  const nextAvatar =
    patch.userAvatar !== undefined
      ? patch.userAvatar
      : (state.userAvatar ?? null);

  return {
    ok: true,
    state: {
      ...state,
      userName: nextUserName,
      userAvatar: nextAvatar,
    },
  };
}

export function applyAppearanceUpdate(
  state: OSState,
  patch: Partial<AppearanceSettingsData>,
): SettingsMutationResult {
  if (patch.theme === undefined) {
    return { ok: true, state };
  }
  const themeCheck = validateTheme(patch.theme);
  if (!themeCheck.valid) {
    return { ok: false, error: themeCheck.error };
  }
  return {
    ok: true,
    state: {
      ...state,
      theme: themeCheck.value,
    },
  };
}

export function applyWorkspaceUpdate(
  state: OSState,
  patch: {
    foundation?: Partial<OSState["foundation"]>;
    defaultReviewPeriod?: WorkspaceSettingsData["defaultReviewPeriod"];
  },
): SettingsMutationResult {
  let nextFoundation = state.foundation;
  if (patch.foundation) {
    const fCheck = validateFoundation(patch.foundation, state.foundation);
    if (!fCheck.valid) {
      return { ok: false, error: fCheck.error };
    }
    nextFoundation = fCheck.value;
  }

  let nextReviewSettings = state.reviewSettings ?? defaultReviewSettings;
  if (patch.defaultReviewPeriod !== undefined) {
    const periodCheck = validateReviewPeriod(patch.defaultReviewPeriod);
    if (!periodCheck.valid) {
      return { ok: false, error: periodCheck.error };
    }
    nextReviewSettings = {
      ...nextReviewSettings,
      defaultPeriod: periodCheck.value,
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      foundation: nextFoundation,
      reviewSettings: nextReviewSettings,
    },
  };
}

export function applyDailyPreferencesUpdate(
  state: OSState,
  patch: Partial<DailyPreferencesData>,
): SettingsMutationResult {
  const current = selectDailyPreferences(state);

  const tzCheck = validateTimeZone(patch.timeZone ?? current.timeZone);
  if (!tzCheck.valid) return { ok: false, error: tzCheck.error };

  const weekStartCheck = validateWeekStartDay(
    patch.weekStartDay ?? current.weekStartDay,
  );
  if (!weekStartCheck.valid) return { ok: false, error: weekStartCheck.error };

  const dayTypeCheck = validateDayType(
    patch.defaultDayType ?? current.defaultDayType,
  );
  if (!dayTypeCheck.valid) return { ok: false, error: dayTypeCheck.error };

  const hoursCheck = validateDayTypeHoursMap(
    patch.dayTypeHours ?? current.dayTypeHours,
  );
  if (!hoursCheck.valid) return { ok: false, error: hoursCheck.error };

  const constraintsCheck = validateConstraints(
    patch.constraints ?? current.constraints,
  );
  if (!constraintsCheck.valid) {
    return { ok: false, error: constraintsCheck.error };
  }

  const nextTimer = patch.timer ?? current.timer;
  const baseReviewSettings = state.reviewSettings ?? defaultReviewSettings;

  return {
    ok: true,
    state: {
      ...state,
      prefs: {
        ...state.prefs,
        timer: nextTimer,
        defaultDayType: dayTypeCheck.value,
        dayTypeHours: hoursCheck.value,
        constraints: constraintsCheck.value,
        timeZone: tzCheck.value,
      },
      reviewSettings: {
        ...baseReviewSettings,
        weekStartDay: weekStartCheck.value,
      },
    },
  };
}

function normalizeP3StoragePayload(raw: unknown): P3StorageSchema {
  const defaultState = createDefaultP3Storage();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return defaultState;
  }
  const r = raw as Partial<P3StorageSchema>;
  return {
    schemaVersion: P3_SCHEMA_VERSION,
    updatedAt:
      typeof r.updatedAt === "string" ? r.updatedAt : defaultState.updatedAt,
    foundations:
      Array.isArray(r.foundations) && r.foundations.length > 0
        ? r.foundations
        : defaultState.foundations,
    domains: Array.isArray(r.domains) ? r.domains : [],
    subjects: Array.isArray(r.subjects) ? r.subjects : [],
    topics: Array.isArray(r.topics) ? r.topics : [],
    questions: Array.isArray(r.questions) ? r.questions : [],
    sessions: Array.isArray(r.sessions) ? r.sessions : [],
    knowledgeUnits: Array.isArray(r.knowledgeUnits) ? r.knowledgeUnits : [],
    sources: Array.isArray(r.sources) ? r.sources : [],
    evidence: Array.isArray(r.evidence) ? r.evidence : [],
    relationships: Array.isArray(r.relationships) ? r.relationships : [],
    applications: Array.isArray(r.applications) ? r.applications : [],
    reviews: Array.isArray(r.reviews) ? r.reviews : [],
    inbox: Array.isArray(r.inbox) ? r.inbox : [],
    context:
      r.context && typeof r.context === "object" && !Array.isArray(r.context)
        ? r.context
        : defaultState.context,
    backupSnapshots: Array.isArray(r.backupSnapshots) ? r.backupSnapshots : [],
    ...(r.legacyArchive !== undefined
      ? { legacyArchive: r.legacyArchive }
      : {}),
  };
}

function removeP3ActiveInquiryKeys(storage: Storage): void {
  const keysToRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k && k.startsWith(P3_ACTIVE_INQUIRY_PREFIX)) {
      keysToRemove.push(k);
    }
  }
  for (const k of keysToRemove) {
    storage.removeItem(k);
  }
}

export function buildBackupExport(state: OSState): string {
  let p3Storage: P3StorageSchema = createDefaultP3Storage();
  const p3ActiveInquiries: Record<string, Record<string, unknown>> = {};

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const p3Raw = window.localStorage.getItem(P3_STORAGE_KEY);
      if (p3Raw) {
        const parsedP3 = JSON.parse(p3Raw);
        if (
          parsedP3 &&
          typeof parsedP3 === "object" &&
          !Array.isArray(parsedP3)
        ) {
          p3Storage = normalizeP3StoragePayload(parsedP3);
        }
      }

      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(P3_ACTIVE_INQUIRY_PREFIX)) {
          const rawInq = window.localStorage.getItem(key);
          if (rawInq) {
            try {
              const parsedInq = JSON.parse(rawInq);
              if (
                parsedInq &&
                typeof parsedInq === "object" &&
                !Array.isArray(parsedInq) &&
                typeof (parsedInq as Record<string, unknown>)["currentStep"] ===
                  "string"
              ) {
                p3ActiveInquiries[key] = parsedInq as Record<string, unknown>;
              }
            } catch {
              /* skip malformed inquiry entry */
            }
          }
        }
      }
    }
  } catch {
    /* fallback to default P3 snapshot if storage is inaccessible */
  }

  return JSON.stringify(
    {
      ...state,
      p3Storage,
      p3ActiveInquiries,
    },
    null,
    2,
  );
}

export function applyValidatedRestore(
  parsedPayload: Record<string, unknown>,
): OSState {
  // Re-verify backup structure before mutating any storage keys
  const check = validateBackupJson(JSON.stringify(parsedPayload));
  if (!check.valid) {
    throw new Error(check.error);
  }

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      if (parsedPayload["p3Storage"] !== undefined) {
        const normalizedP3 = normalizeP3StoragePayload(
          parsedPayload["p3Storage"],
        );
        window.localStorage.setItem(
          P3_STORAGE_KEY,
          JSON.stringify(normalizedP3),
        );
      }

      if (
        parsedPayload["p3ActiveInquiries"] !== undefined ||
        parsedPayload["p3Storage"] !== undefined
      ) {
        removeP3ActiveInquiryKeys(window.localStorage);
        if (
          parsedPayload["p3ActiveInquiries"] &&
          typeof parsedPayload["p3ActiveInquiries"] === "object" &&
          !Array.isArray(parsedPayload["p3ActiveInquiries"])
        ) {
          const entries = Object.entries(
            parsedPayload["p3ActiveInquiries"] as Record<string, unknown>,
          );
          for (const [key, val] of entries) {
            if (
              key.startsWith(P3_ACTIVE_INQUIRY_PREFIX) &&
              val &&
              typeof val === "object" &&
              !Array.isArray(val)
            ) {
              window.localStorage.setItem(key, JSON.stringify(val));
            }
          }
        }
      }
    }
  } catch {
    /* ignore storage write error cleanly */
  }

  // Strip P3 envelope keys so P3 is never merged into the primary P1/P2 OSState model
  const {
    p3Storage: _p3Storage,
    p3ActiveInquiries: _p3ActiveInquiries,
    ...primaryPayload
  } = parsedPayload;
  void _p3Storage;
  void _p3ActiveInquiries;

  return syncPrioritiesWithProjects(migrateOSState(primaryPayload));
}

export function buildFactoryResetState(): OSState {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(P3_STORAGE_KEY);
      removeP3ActiveInquiryKeys(window.localStorage);
    }
  } catch {
    /* ignore storage removal error cleanly */
  }
  return syncPrioritiesWithProjects(migrateOSState(initialState));
}

export function collectStorageDiagnostics(state: OSState): StorageDiagnostics {
  let primaryBytes = 0;
  let p3Bytes = 0;
  let p3KnowledgeUnitsCount = 0;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const primaryRaw = window.localStorage.getItem(PRIMARY_STORAGE_KEY) || "";
      primaryBytes = primaryRaw.length * 2;

      const p3Raw = window.localStorage.getItem(P3_STORAGE_KEY) || "";
      p3Bytes = p3Raw.length * 2;
      if (p3Raw) {
        const parsedP3 = JSON.parse(p3Raw) as {
          knowledgeUnits?: unknown;
        } | null;
        if (parsedP3 && Array.isArray(parsedP3.knowledgeUnits)) {
          p3KnowledgeUnitsCount = parsedP3.knowledgeUnits.length;
        }
      }
    }
  } catch {
    /* ignore storage inspection failures cleanly */
  }

  const primaryKb = Math.round((primaryBytes / 1024) * 10) / 10;
  const p3Kb = Math.round((p3Bytes / 1024) * 10) / 10;
  const totalKb = Math.round(((primaryBytes + p3Bytes) / 1024) * 10) / 10;

  return {
    primaryStorageKey: PRIMARY_STORAGE_KEY,
    primaryBytes,
    primaryKb,
    p3StorageKey: P3_STORAGE_KEY,
    p3Bytes,
    p3Kb,
    totalKb,
    projectCount: state.projects.length,
    historyDaysCount: state.history.length,
    knowledgeItemsCount: state.knowledge.length,
    p3KnowledgeUnitsCount,
    schemaVersion: state.schemaVersion ?? CURRENT_SCHEMA_VERSION,
  };
}

export function formatDateInTimeZone(date: Date, timeZone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  if (timeZone && timeZone !== DEFAULT_TIMEZONE && isValidTimeZone(timeZone)) {
    options.timeZone = timeZone;
  }

  try {
    return date.toLocaleDateString("en-GB", options);
  } catch {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
}

export function getHourInTimeZone(date: Date, timeZone?: string): number {
  if (timeZone && timeZone !== DEFAULT_TIMEZONE && isValidTimeZone(timeZone)) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone,
      }).formatToParts(date);
      const hourPart = parts.find((p) => p.type === "hour");
      if (hourPart) {
        const parsed = Number.parseInt(hourPart.value, 10);
        if (Number.isFinite(parsed)) {
          return parsed === 24 ? 0 : parsed;
        }
      }
    } catch {
      /* fallback to local clock */
    }
  }
  return date.getHours();
}
