import type { DayType, OSState, ReviewSettings, Theme } from "@/lib/os/types";

export const APP_VERSION = "0.1.0";
export const PRIMARY_STORAGE_KEY = "yash-os-v1";
export const P3_STORAGE_KEY = "yash-os-p3-v1";
export const P3_ACTIVE_INQUIRY_PREFIX = "yash-os-p3-active-inquiry-";

export interface ProfileSettingsData {
  userName: string;
  userAvatar: string | null;
}

export interface AppearanceSettingsData {
  theme: Theme;
}

export interface WorkspaceSettingsData {
  foundation: OSState["foundation"];
  defaultReviewPeriod: ReviewSettings["defaultPeriod"];
}

export interface DailyPreferencesData {
  timeZone: string;
  weekStartDay: 0 | 1;
  defaultDayType: DayType;
  dayTypeHours: Record<DayType, number>;
  timer: boolean;
  constraints: string;
}

export interface NotificationSettingsData {
  supported: false;
  browserAlertsEnabled: false;
}

export interface StorageDiagnostics {
  primaryStorageKey: string;
  primaryBytes: number;
  primaryKb: number;
  p3StorageKey: string;
  p3Bytes: number;
  p3Kb: number;
  totalKb: number;
  projectCount: number;
  historyDaysCount: number;
  knowledgeItemsCount: number;
  p3KnowledgeUnitsCount: number;
  schemaVersion: number;
}

export interface BackupSummary {
  schemaVersion: number;
  userName: string;
  projectCount: number;
  historyCount: number;
  knowledgeCount: number;
  p3KnowledgeUnitsCount?: number | undefined;
  p3ActiveInquiriesCount?: number | undefined;
}

export type SettingsValidationResult<T> =
  { valid: true; value: T } | { valid: false; error: string };

export type SettingsMutationResult =
  { ok: true; state: OSState } | { ok: false; error: string };
