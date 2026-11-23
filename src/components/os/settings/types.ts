import {
  Bell,
  CalendarClock,
  Compass,
  HardDrive,
  Palette,
  ShieldCheck,
  User,
  type LucideIcon,
} from "lucide-react";

export type SettingsCategory =
  | "profile"
  | "appearance"
  | "workspace"
  | "daily"
  | "notifications"
  | "data"
  | "system";

export interface SettingsCategoryMeta {
  id: SettingsCategory;
  label: string;
  description: string;
  shortDesc: string;
  icon: LucideIcon;
}

export const SETTINGS_CATEGORIES: SettingsCategoryMeta[] = [
  {
    id: "profile",
    label: "Profile & Identity",
    description:
      "Manage your personal founder name and circular profile photo.",
    shortDesc: "Name and profile photo",
    icon: User,
  },
  {
    id: "appearance",
    label: "Appearance",
    description:
      "Select between Blue dark theme, White light theme, or OS default.",
    shortDesc: "Blue, white and system themes",
    icon: Palette,
  },
  {
    id: "workspace",
    label: "Workspace Preferences",
    description:
      "Configure strategic workspace narrative and default review landing view.",
    shortDesc: "Foundation and review defaults",
    icon: Compass,
  },
  {
    id: "daily",
    label: "Daily Preferences",
    description:
      "Configure time zone, week start day, default day hours, timer, and daily constraints.",
    shortDesc: "Schedule, hours and daily loop",
    icon: CalendarClock,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Status of notification and reminder support in Yash OS.",
    shortDesc: "Reminder support status",
    icon: Bell,
  },
  {
    id: "data",
    label: "Data & Storage",
    description:
      "Inspect local browser storage, export backups, validate restores, or reset data.",
    shortDesc: "Storage status, backup and restore",
    icon: HardDrive,
  },
  {
    id: "system",
    label: "System & Privacy",
    description:
      "Application version, active schema diagnostics, and client-side privacy boundaries.",
    shortDesc: "Version, schema and boundaries",
    icon: ShieldCheck,
  },
];
