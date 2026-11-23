import { describe, expect, it } from "vitest";
import {
  SETTINGS_CATEGORIES,
  type SettingsCategory,
} from "@/components/os/settings/types";
import { initialState } from "@/lib/os/seed";
import {
  APP_VERSION,
  P3_ACTIVE_INQUIRY_PREFIX,
  P3_STORAGE_KEY,
  PRIMARY_STORAGE_KEY,
  applyAppearanceUpdate,
  applyDailyPreferencesUpdate,
  applyProfileUpdate,
  applyValidatedRestore,
  applyWorkspaceUpdate,
  buildBackupExport,
  buildFactoryResetState,
  collectStorageDiagnostics,
  formatDateInTimeZone,
  getHourInTimeZone,
  selectAppearanceSettings,
  selectDailyPreferences,
  selectNotificationSettings,
  selectProfileSettings,
  selectWorkspaceSettings,
  validateBackupJson,
  validateDayTypeHour,
  validateTimeZone,
  validateUserName,
} from "@/lib/os/settings";
import { getISOWeekRange } from "@/lib/os/reviews/analytics";

describe("Settings Module Information Architecture & Domain Service", () => {
  it("defines the 7 approved settings categories with complete metadata", () => {
    expect(SETTINGS_CATEGORIES).toHaveLength(7);

    const ids = SETTINGS_CATEGORIES.map((c) => c.id);
    const expectedCategories: SettingsCategory[] = [
      "profile",
      "appearance",
      "workspace",
      "daily",
      "notifications",
      "data",
      "system",
    ];

    expect(ids).toEqual(expectedCategories);

    for (const cat of SETTINGS_CATEGORIES) {
      expect(cat.id).toBeDefined();
      expect(cat.label.length).toBeGreaterThan(0);
      expect(cat.description.length).toBeGreaterThan(0);
      expect(cat.shortDesc.length).toBeGreaterThan(0);
      expect(cat.icon).toBeDefined();
    }
  });

  it("provides safe defaults via domain selectors for both fresh and legacy states", () => {
    const profile = selectProfileSettings(initialState);
    expect(profile.userName).toBe("Yash");
    expect(profile.userAvatar).toBeNull();

    const appearance = selectAppearanceSettings(initialState);
    expect(appearance.theme).toBe("dark");

    const workspace = selectWorkspaceSettings(initialState);
    expect(workspace.foundation.northStar).toBe(
      "Build systems that remove human friction.",
    );
    expect(workspace.defaultReviewPeriod).toBe("daily");

    const daily = selectDailyPreferences(initialState);
    expect(daily.timeZone).toBe("auto");
    expect(daily.weekStartDay).toBe(1);
    expect(daily.defaultDayType).toBe("Non-College Day");
    expect(daily.timer).toBe(true);

    const notifications = selectNotificationSettings();
    expect(notifications).toEqual({
      supported: false,
      browserAlertsEnabled: false,
    });
  });

  it("validates invalid inputs cleanly and rejects bad mutations", () => {
    expect(validateUserName("   ").valid).toBe(false);
    expect(validateUserName("A".repeat(81)).valid).toBe(false);
    expect(validateUserName("  Founder  ")).toEqual({
      valid: true,
      value: "Founder",
    });

    expect(validateDayTypeHour(Number.NaN).valid).toBe(false);
    expect(validateDayTypeHour(-1).valid).toBe(false);
    expect(validateDayTypeHour(17).valid).toBe(false);
    expect(validateDayTypeHour(6.5)).toEqual({ valid: true, value: 6.5 });

    expect(validateTimeZone("Invalid/Zone_XYZ").valid).toBe(false);
    expect(validateTimeZone("UTC").valid).toBe(true);
    expect(validateTimeZone("auto").valid).toBe(true);

    const badProfile = applyProfileUpdate(initialState, { userName: "  " });
    expect(badProfile.ok).toBe(false);

    const badWorkspace = applyWorkspaceUpdate(initialState, {
      foundation: { northStar: "   " },
    });
    expect(badWorkspace.ok).toBe(false);

    const badDaily = applyDailyPreferencesUpdate(initialState, {
      dayTypeHours: {
        ...initialState.prefs.dayTypeHours,
        Custom: Number.NaN,
      },
    });
    expect(badDaily.ok).toBe(false);
  });

  it("preserves P1/P2/P3 operational records when updating Workspace & Daily settings", () => {
    const baseState = buildFactoryResetState();
    const res1 = applyWorkspaceUpdate(baseState, {
      foundation: { northStar: "Focused execution infrastructure." },
      defaultReviewPeriod: "weekly",
    });
    expect(res1.ok).toBe(true);
    if (!res1.ok) return;

    const res2 = applyDailyPreferencesUpdate(res1.state, {
      timeZone: "Asia/Kolkata",
      weekStartDay: 0,
      defaultDayType: "College Day",
      dayTypeHours: {
        ...res1.state.prefs.dayTypeHours,
        "College Day": 5,
      },
      timer: false,
      constraints: "No calls before 13:00.",
    });
    expect(res2.ok).toBe(true);
    if (!res2.ok) return;

    expect(res2.state.priorities).toEqual(baseState.priorities);
    expect(res2.state.projects).toEqual(baseState.projects);
    expect(res2.state.tradingOperation).toEqual(baseState.tradingOperation);
    expect(res2.state.prefs.defaultDayType).toBe("College Day");
    expect(res2.state.prefs.dayTypeHours["College Day"]).toBe(5);
    expect(res2.state.prefs.constraints).toBe("No calls before 13:00.");
    expect(res2.state.reviewSettings?.defaultPeriod).toBe("weekly");
    expect(res2.state.reviewSettings?.weekStartDay).toBe(0);
  });

  it("supports Appearance theme transitions without altering unrelated state", () => {
    const resLight = applyAppearanceUpdate(initialState, { theme: "light" });
    expect(resLight.ok).toBe(true);
    if (resLight.ok) {
      expect(resLight.state.theme).toBe("light");
    }

    const resSystem = applyAppearanceUpdate(initialState, { theme: "system" });
    expect(resSystem.ok).toBe(true);
    if (resSystem.ok) {
      expect(resSystem.state.theme).toBe("system");
    }
  });

  it("validates backup JSON strictly, migrates restores & factory resets to v5, and excludes P2 financial data from diagnostics", () => {
    expect(validateBackupJson("{not json").valid).toBe(false);
    expect(validateBackupJson("null").valid).toBe(false);
    expect(validateBackupJson("{}").valid).toBe(false);
    expect(validateBackupJson('{"priorities":[]}').valid).toBe(false);

    const resetState = buildFactoryResetState();
    expect(resetState.schemaVersion).toBe(5);
    expect(resetState.tradingOperation).toBeDefined();

    const exported = buildBackupExport({
      ...resetState,
      userName: "Audit Founder",
    });
    const check = validateBackupJson(exported);
    expect(check.valid).toBe(true);
    if (!check.valid) return;
    expect(check.value.summary.userName).toBe("Audit Founder");
    expect(check.value.summary.schemaVersion).toBe(5);

    const restored = applyValidatedRestore(check.value.payload);
    expect(restored.userName).toBe("Audit Founder");
    expect(restored.schemaVersion).toBe(5);

    localStorage.setItem(PRIMARY_STORAGE_KEY, exported);
    localStorage.setItem(
      P3_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, knowledgeUnits: [{ id: "ku-1" }] }),
    );
    const diag = collectStorageDiagnostics(restored);
    expect(diag.primaryKb).toBeGreaterThan(0);
    expect(diag.p3Kb).toBeGreaterThan(0);
    expect(diag.p3KnowledgeUnitsCount).toBe(1);
    expect(JSON.stringify(diag)).not.toContain("grossPnL");
    expect(JSON.stringify(diag)).not.toContain("accountSize");
    expect(APP_VERSION).toBe("0.1.0");
  });

  it("applies weekStartDay and timeZone helpers accurately for consumers", () => {
    const monRange = getISOWeekRange("2026-11-22T12:00:00", 1); // Sunday
    expect(monRange.startDate).toBe("2026-11-16");
    expect(monRange.endDate).toBe("2026-11-22");

    const sunRange = getISOWeekRange("2026-11-22T12:00:00", 0); // Sunday starts week
    expect(sunRange.startDate).toBe("2026-11-22");
    expect(sunRange.endDate).toBe("2026-11-28");

    const sampleInstant = new Date("2026-11-22T20:00:00Z"); // 20:00 UTC -> next day 01:30 in IST
    expect(getHourInTimeZone(sampleInstant, "UTC")).toBe(20);
    expect(getHourInTimeZone(sampleInstant, "Asia/Kolkata")).toBe(1);
    expect(formatDateInTimeZone(sampleInstant, "Asia/Kolkata")).toContain("23");
  });

  it("DEF-002 Regression: exports, validates, restores, and factory-resets complete P3 storage and active inquiry state without merging P3 into primary OSState", () => {
    localStorage.clear();

    const baseState = buildFactoryResetState();
    const customP3Payload = {
      schemaVersion: 1,
      updatedAt: "2026-11-22T18:00:00.000Z",
      foundations: [],
      domains: [
        {
          id: "dom-1",
          name: "Systems Engineering",
          description: "Control & distributed systems",
          isArchived: false,
          createdAt: "2026-11-22T18:00:00.000Z",
          updatedAt: "2026-11-22T18:00:00.000Z",
        },
      ],
      subjects: [],
      topics: [],
      questions: [
        {
          id: "q-p3-backup",
          question: "How does backpressure stabilize queue depth?",
          description: "Queue stability analysis",
          origin: "reality",
          priority: "immediate",
          status: "open",
          linkedSessionIds: [],
          linkedKnowledgeUnitIds: ["ku-p3-backup"],
          currentUnderstanding: "Bounds memory growth",
          remainingGaps: "",
          nextLogicalStep: "",
          classification: "general",
          createdAt: "2026-11-22T18:00:00.000Z",
          updatedAt: "2026-11-22T18:00:00.000Z",
        },
      ],
      sessions: [],
      knowledgeUnits: [
        {
          id: "ku-p3-backup",
          title: "Backpressure Queue Invariant",
          summary: "Bounded queues prevent cascading OOM.",
          perspective: "objective_knowledge",
          status: "captured",
          classification: "general",
          identity: {
            id: "ku-p3-backup",
            title: "Backpressure Queue Invariant",
            perspective: "objective_knowledge",
            classification: "general",
            tags: ["systems"],
          },
          coreUnderstanding: {
            plainEnglishExplanation: "Bound queue depth to shed load early.",
            corePrinciples: ["Never buffer unboundedly"],
            mentalModels: ["Valve control"],
          },
          deeperUnderstanding: {
            nuancedMechanisms: "",
            boundaryConditions: "",
            counterExamples: [],
          },
          sourcesAndEvidence: {
            sourceIds: [],
            evidenceIds: [],
            competingTheories: ["Drop-tail buffering"],
          },
          relationshipsAndApplications: {
            relationshipIds: [],
            applicationRecordIds: [],
          },
          developmentHistory: { revisions: [] },
          isArchived: false,
          createdAt: "2026-11-22T18:00:00.000Z",
          updatedAt: "2026-11-22T18:00:00.000Z",
        },
      ],
      sources: [],
      evidence: [],
      relationships: [],
      applications: [],
      reviews: [],
      inbox: [],
      context: {
        id: "ctx-default",
        currentFocus: "Backpressure",
        lastStoppingPoint: "Queue model",
        remainingGaps: "None",
        nextLogicalStep: "Apply in P1",
        lastActivityAt: "2026-11-22T18:00:00.000Z",
        updatedAt: "2026-11-22T18:00:00.000Z",
      },
      backupSnapshots: [],
    };

    const inquiryKey = `${P3_ACTIVE_INQUIRY_PREFIX}p3-proj-1`;
    const activeInquiryDraft = {
      currentStep: "session_review",
      selectedField: "Engineering",
      subjectName: "Control Theory",
      topicName: "Backpressure",
      questionText: "How does backpressure stabilize queue depth?",
      updatedAt: "2026-11-22T18:05:00.000Z",
    };

    localStorage.setItem(P3_STORAGE_KEY, JSON.stringify(customP3Payload));
    localStorage.setItem(inquiryKey, JSON.stringify(activeInquiryDraft));

    // 1. Export full backup and verify P3 storage + active inquiry inclusion
    const exportedJson = buildBackupExport({
      ...baseState,
      userName: "P3 Backup Founder",
    });
    const parsedExport = JSON.parse(exportedJson) as Record<string, unknown>;
    expect(parsedExport["p3Storage"]).toBeDefined();
    expect(parsedExport["p3ActiveInquiries"]).toBeDefined();

    const validation = validateBackupJson(exportedJson);
    expect(validation.valid).toBe(true);
    if (!validation.valid) return;
    expect(validation.value.summary.p3KnowledgeUnitsCount).toBe(1);
    expect(validation.value.summary.p3ActiveInquiriesCount).toBe(1);

    // 2. Reject invalid / incomplete P3 backup structures
    expect(
      validateBackupJson(
        JSON.stringify({ ...baseState, p3Storage: "not-an-object" }),
      ).valid,
    ).toBe(false);
    expect(
      validateBackupJson(JSON.stringify({ ...baseState, p3Storage: {} })).valid,
    ).toBe(false);
    expect(
      validateBackupJson(
        JSON.stringify({
          ...baseState,
          p3Storage: { schemaVersion: 1, knowledgeUnits: "corrupt" },
        }),
      ).valid,
    ).toBe(false);
    expect(
      validateBackupJson(
        JSON.stringify({
          ...baseState,
          p3ActiveInquiries: { "bad-key": { currentStep: "active_session" } },
        }),
      ).valid,
    ).toBe(false);
    expect(
      validateBackupJson(
        JSON.stringify({
          ...baseState,
          p3ActiveInquiries: {
            [inquiryKey]: { notCurrentStep: 123 },
          },
        }),
      ).valid,
    ).toBe(false);

    // 3. Factory reset clears P3 storage and active inquiries
    const afterFactoryReset = buildFactoryResetState();
    expect(afterFactoryReset.userName).toBe("Yash");
    expect(localStorage.getItem(P3_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(inquiryKey)).toBeNull();

    // 4. Restore from exported backup restores both P3 storage and active inquiry without polluting primary OSState
    const restoredPrimary = applyValidatedRestore(validation.value.payload);
    expect(restoredPrimary.userName).toBe("P3 Backup Founder");
    expect(
      "p3Storage" in (restoredPrimary as unknown as Record<string, unknown>),
    ).toBe(false);
    expect(
      "p3ActiveInquiries" in
        (restoredPrimary as unknown as Record<string, unknown>),
    ).toBe(false);

    const restoredP3Raw = localStorage.getItem(P3_STORAGE_KEY);
    expect(restoredP3Raw).not.toBeNull();
    const restoredP3 = JSON.parse(restoredP3Raw!) as {
      knowledgeUnits: Array<{ id: string; title: string }>;
      questions: Array<{ id: string }>;
    };
    expect(restoredP3.knowledgeUnits).toHaveLength(1);
    expect(restoredP3.knowledgeUnits[0]?.id).toBe("ku-p3-backup");
    expect(restoredP3.questions).toHaveLength(1);

    const restoredInquiryRaw = localStorage.getItem(inquiryKey);
    expect(restoredInquiryRaw).not.toBeNull();
    expect(JSON.parse(restoredInquiryRaw!).currentStep).toBe("session_review");
  });
});
