import type { DayType, OSState, ReviewSettings, Theme } from "@/lib/os/types";
import { P3_SCHEMA_VERSION } from "@/priority3/infrastructure/persistence/types";
import {
  P3_ACTIVE_INQUIRY_PREFIX,
  type BackupSummary,
  type SettingsValidationResult,
} from "./types";

export const DEFAULT_TIMEZONE = "auto";

export const COMMON_TIMEZONES: ReadonlyArray<{
  value: string;
  label: string;
}> = [
  { value: "auto", label: "Automatic (Browser Default)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)" },
  { value: "America/New_York", label: "America/New_York (ET)" },
  { value: "America/Chicago", label: "America/Chicago (CT)" },
  { value: "America/Denver", label: "America/Denver (MT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PT)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];

export const VALID_THEMES: readonly Theme[] = ["dark", "light", "system"];
export const VALID_DAY_TYPES: readonly DayType[] = [
  "College Day",
  "Non-College Day",
  "Weekend/Holiday",
  "Custom",
];
export const VALID_REVIEW_PERIODS: readonly ReviewSettings["defaultPeriod"][] =
  ["daily", "weekly", "monthly", "history"];

export const MIN_DAY_HOURS = 0;
export const MAX_DAY_HOURS = 16;

export function getDetectedTimeZone(): string {
  try {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return resolved && resolved.trim().length > 0 ? resolved : "UTC";
  } catch {
    return "UTC";
  }
}

export function isValidTimeZone(tz: string): boolean {
  if (tz === DEFAULT_TIMEZONE) return true;
  if (!tz || !tz.trim()) return false;
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function validateTimeZone(
  tz: unknown,
): SettingsValidationResult<string> {
  if (typeof tz !== "string" || !isValidTimeZone(tz)) {
    return { valid: false, error: "Select a valid IANA time zone." };
  }
  return { valid: true, value: tz };
}

export function validateUserName(
  name: unknown,
): SettingsValidationResult<string> {
  if (typeof name !== "string") {
    return { valid: false, error: "Display name must be text." };
  }
  const trimmed = name.trim();
  if (!trimmed) {
    return { valid: false, error: "Display name cannot be empty." };
  }
  if (trimmed.length > 80) {
    return {
      valid: false,
      error: "Display name must be 80 characters or fewer.",
    };
  }
  return { valid: true, value: trimmed };
}

export function validateTheme(theme: unknown): SettingsValidationResult<Theme> {
  if (typeof theme !== "string" || !VALID_THEMES.includes(theme as Theme)) {
    return {
      valid: false,
      error: "Theme must be dark, light, or system.",
    };
  }
  return { valid: true, value: theme as Theme };
}

export function validateDayType(
  dayType: unknown,
): SettingsValidationResult<DayType> {
  if (
    typeof dayType !== "string" ||
    !VALID_DAY_TYPES.includes(dayType as DayType)
  ) {
    return { valid: false, error: "Invalid day type selected." };
  }
  return { valid: true, value: dayType as DayType };
}

export function validateDayTypeHour(
  hours: unknown,
): SettingsValidationResult<number> {
  if (typeof hours !== "number" || !Number.isFinite(hours)) {
    return {
      valid: false,
      error: "Daily hours must be a valid finite number.",
    };
  }
  if (hours < MIN_DAY_HOURS || hours > MAX_DAY_HOURS) {
    return {
      valid: false,
      error: `Daily hours must be between ${MIN_DAY_HOURS} and ${MAX_DAY_HOURS}.`,
    };
  }
  const rounded = Math.round(hours * 2) / 2;
  return { valid: true, value: rounded };
}

export function validateDayTypeHoursMap(
  map: unknown,
): SettingsValidationResult<Record<DayType, number>> {
  if (!map || typeof map !== "object" || Array.isArray(map)) {
    return { valid: false, error: "Day type hours must be a valid map." };
  }
  const record = map as Record<string, unknown>;
  const normalized = {} as Record<DayType, number>;
  for (const dt of VALID_DAY_TYPES) {
    const res = validateDayTypeHour(record[dt]);
    if (!res.valid) {
      return { valid: false, error: `${dt}: ${res.error}` };
    }
    normalized[dt] = res.value;
  }
  return { valid: true, value: normalized };
}

export function validateWeekStartDay(
  day: unknown,
): SettingsValidationResult<0 | 1> {
  if (day !== 0 && day !== 1) {
    return {
      valid: false,
      error: "Week start day must be Sunday (0) or Monday (1).",
    };
  }
  return { valid: true, value: day };
}

export function validateReviewPeriod(
  period: unknown,
): SettingsValidationResult<ReviewSettings["defaultPeriod"]> {
  if (
    typeof period !== "string" ||
    !VALID_REVIEW_PERIODS.includes(period as ReviewSettings["defaultPeriod"])
  ) {
    return {
      valid: false,
      error: "Default reviews view must be daily, weekly, monthly, or history.",
    };
  }
  return {
    valid: true,
    value: period as ReviewSettings["defaultPeriod"],
  };
}

export function validateFoundation(
  patch: Partial<OSState["foundation"]>,
  current: OSState["foundation"],
): SettingsValidationResult<OSState["foundation"]> {
  const next: OSState["foundation"] = {
    northStar: patch.northStar ?? current.northStar,
    northStarLong: patch.northStarLong ?? current.northStarLong,
    mission: patch.mission ?? current.mission,
    trajectory: patch.trajectory ?? current.trajectory,
    phases: patch.phases ?? current.phases,
  };

  if (!next.northStar.trim()) {
    return {
      valid: false,
      error: "North Star concise vision cannot be empty.",
    };
  }
  if (next.northStar.trim().length > 200) {
    return {
      valid: false,
      error: "North Star concise vision must be 200 characters or fewer.",
    };
  }
  if (
    next.northStarLong.length > 600 ||
    next.mission.length > 600 ||
    next.trajectory.length > 600
  ) {
    return {
      valid: false,
      error: "Narrative fields must be 600 characters or fewer.",
    };
  }
  if (!Array.isArray(next.phases) || next.phases.length === 0) {
    return {
      valid: false,
      error: "Strategic phases cannot be empty.",
    };
  }

  return {
    valid: true,
    value: {
      northStar: next.northStar.trim(),
      northStarLong: next.northStarLong.trim(),
      mission: next.mission.trim(),
      trajectory: next.trajectory.trim(),
      phases: next.phases.map((p, idx) => p.trim() || `Phase ${idx + 1}`),
    },
  };
}

export function validateConstraints(
  text: unknown,
): SettingsValidationResult<string> {
  if (typeof text !== "string") {
    return { valid: false, error: "Constraints must be text." };
  }
  if (text.length > 1000) {
    return {
      valid: false,
      error: "Operating constraints must be 1000 characters or fewer.",
    };
  }
  return { valid: true, value: text };
}

export function validateBackupJson(rawText: string): SettingsValidationResult<{
  payload: Record<string, unknown>;
  summary: BackupSummary;
}> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { valid: false, error: "Backup file does not contain valid JSON." };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      valid: false,
      error: "Backup file must be a valid Yash OS state JSON object.",
    };
  }

  const record = parsed as Record<string, unknown>;
  const hasPriorities = Array.isArray(record["priorities"]);
  const hasFoundation =
    Boolean(record["foundation"]) &&
    typeof record["foundation"] === "object" &&
    !Array.isArray(record["foundation"]);
  const hasPrefs =
    Boolean(record["prefs"]) &&
    typeof record["prefs"] === "object" &&
    !Array.isArray(record["prefs"]);

  if (!hasPriorities || (!hasFoundation && !hasPrefs)) {
    return {
      valid: false,
      error:
        "Backup structure is invalid: missing core priorities and workspace/preferences fields.",
    };
  }

  // Validate primary collection fields if present
  const primaryArrayFields = [
    "projects",
    "history",
    "knowledge",
    "bottlenecks",
    "improvements",
    "periodReviews",
  ] as const;
  for (const field of primaryArrayFields) {
    if (record[field] !== undefined && !Array.isArray(record[field])) {
      return {
        valid: false,
        error: `Backup structure is invalid: '${field}' must be an array.`,
      };
    }
  }

  // Validate Priority 3 storage payload if present
  let p3KnowledgeUnitsCount = 0;
  if (record["p3Storage"] !== undefined) {
    const rawP3 = record["p3Storage"];
    if (!rawP3 || typeof rawP3 !== "object" || Array.isArray(rawP3)) {
      return {
        valid: false,
        error:
          "Backup structure is invalid: malformed Priority 3 storage payload.",
      };
    }
    const p3Obj = rawP3 as Record<string, unknown>;
    const p3Version = p3Obj["schemaVersion"];
    const hasValidP3Version =
      typeof p3Version === "number" &&
      Number.isFinite(p3Version) &&
      p3Version >= 1 &&
      p3Version <= P3_SCHEMA_VERSION;
    const p3ArrayFields = [
      "foundations",
      "domains",
      "subjects",
      "topics",
      "questions",
      "sessions",
      "knowledgeUnits",
      "sources",
      "evidence",
      "relationships",
      "applications",
      "reviews",
      "inbox",
      "backupSnapshots",
    ] as const;

    const hasAtLeastOneP3Collection = p3ArrayFields.some((f) =>
      Array.isArray(p3Obj[f]),
    );
    if (!hasValidP3Version && !hasAtLeastOneP3Collection) {
      return {
        valid: false,
        error:
          "Backup structure is invalid: incomplete Priority 3 storage schema.",
      };
    }
    if (
      p3Version !== undefined &&
      (typeof p3Version !== "number" ||
        !Number.isFinite(p3Version) ||
        p3Version < 1 ||
        p3Version > P3_SCHEMA_VERSION)
    ) {
      return {
        valid: false,
        error:
          "Backup structure is invalid: unsupported Priority 3 schema version.",
      };
    }

    for (const field of p3ArrayFields) {
      if (p3Obj[field] !== undefined && !Array.isArray(p3Obj[field])) {
        return {
          valid: false,
          error: `Backup structure is invalid: Priority 3 '${field}' must be an array.`,
        };
      }
    }

    if (
      p3Obj["context"] !== undefined &&
      (!p3Obj["context"] ||
        typeof p3Obj["context"] !== "object" ||
        Array.isArray(p3Obj["context"]))
    ) {
      return {
        valid: false,
        error:
          "Backup structure is invalid: Priority 3 'context' must be an object.",
      };
    }

    if (Array.isArray(p3Obj["knowledgeUnits"])) {
      p3KnowledgeUnitsCount = p3Obj["knowledgeUnits"].length;
    }
  }

  // Validate Priority 3 active inquiry drafts if present
  let p3ActiveInquiriesCount = 0;
  if (record["p3ActiveInquiries"] !== undefined) {
    const rawInquiries = record["p3ActiveInquiries"];
    if (
      !rawInquiries ||
      typeof rawInquiries !== "object" ||
      Array.isArray(rawInquiries)
    ) {
      return {
        valid: false,
        error:
          "Backup structure is invalid: malformed Priority 3 active inquiry state.",
      };
    }
    const entries = Object.entries(rawInquiries as Record<string, unknown>);
    for (const [key, val] of entries) {
      if (
        !key.trim() ||
        !key.startsWith(P3_ACTIVE_INQUIRY_PREFIX) ||
        !val ||
        typeof val !== "object" ||
        Array.isArray(val) ||
        typeof (val as Record<string, unknown>)["currentStep"] !== "string"
      ) {
        return {
          valid: false,
          error:
            "Backup structure is invalid: malformed Priority 3 active inquiry entry.",
        };
      }
    }
    p3ActiveInquiriesCount = entries.length;
  }

  const schemaVersion =
    typeof record["schemaVersion"] === "number" &&
    Number.isFinite(record["schemaVersion"])
      ? record["schemaVersion"]
      : 1;
  const userName =
    typeof record["userName"] === "string" && record["userName"].trim()
      ? record["userName"].trim()
      : "Founder";
  const projectCount = Array.isArray(record["projects"])
    ? record["projects"].length
    : 0;
  const historyCount = Array.isArray(record["history"])
    ? record["history"].length
    : 0;
  const knowledgeCount = Array.isArray(record["knowledge"])
    ? record["knowledge"].length
    : 0;

  return {
    valid: true,
    value: {
      payload: record,
      summary: {
        schemaVersion,
        userName,
        projectCount,
        historyCount,
        knowledgeCount,
        p3KnowledgeUnitsCount,
        p3ActiveInquiriesCount,
      },
    },
  };
}
