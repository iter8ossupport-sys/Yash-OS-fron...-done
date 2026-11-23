import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React, { useState } from "react";
import { initialState } from "@/lib/os/seed";
import {
  P3_ACTIVE_INQUIRY_PREFIX,
  P3_STORAGE_KEY,
  PRIMARY_STORAGE_KEY,
} from "@/lib/os/settings";
import { OSProvider, useOS } from "@/lib/os/store";
import { AppShell } from "@/components/os/AppShell";
import { PlanContextStep } from "@/components/os/plan/PlanContextStep";
import { Route as SettingsRoute } from "@/routes/settings";

const navSearchListeners = new Set<(section: string | undefined) => void>();
let currentMockSearch: { section?: string | undefined } = {};

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    className,
    to,
    ...props
  }: {
    children?: React.ReactNode;
    className?: string;
    to?: string;
    [key: string]: unknown;
  }) => (
    <a
      href={typeof to === "string" ? to : "/"}
      className={className}
      {...props}
    >
      {children}
    </a>
  ),
  useRouterState: vi.fn(() => "/settings"),
  useNavigate: () => (opts: { search?: { section?: string | undefined } }) => {
    currentMockSearch = opts.search ?? {};
    navSearchListeners.forEach((fn) => fn(currentMockSearch.section));
  },
  createFileRoute: () => (config: Record<string, unknown>) => ({
    ...config,
    options: config,
    useSearch: () => currentMockSearch,
  }),
}));

function StatefulSettingsHarness() {
  const [, setSection] = useState<string | undefined>(
    currentMockSearch.section,
  );
  React.useEffect(() => {
    navSearchListeners.add(setSection);
    return () => {
      navSearchListeners.delete(setSection);
    };
  }, []);
  const SettingsComp = SettingsRoute.options.component as React.ComponentType;
  return <SettingsComp />;
}

function ConsumerInspectionProbe() {
  const { state } = useOS();
  return (
    <div data-testid="consumer-probe">
      <span data-testid="probe-name">{state.userName}</span>
      <span data-testid="probe-theme">{state.theme}</span>
      <span data-testid="probe-day-type">{state.prefs.defaultDayType}</span>
      <span data-testid="probe-week-start">
        {state.reviewSettings?.weekStartDay}
      </span>
      <span data-testid="probe-constraints">{state.prefs.constraints}</span>
      <span data-testid="probe-timer">{String(state.prefs.timer)}</span>
      <PlanContextStep
        draft={{
          context: {
            date: "2026-11-22",
            dayType: state.prefs.defaultDayType ?? "Non-College Day",
            hours:
              state.prefs.dayTypeHours[
                state.prefs.defaultDayType ?? "Non-College Day"
              ],
            commitments: "",
            energy: "Medium",
          },
          allocation: { 1: 3, 2: 2, 3: 1 },
          outcomes: { 1: "", 2: "", 3: "" },
          tasks: [],
        }}
        dayTypeHours={state.prefs.dayTypeHours}
        constraints={state.prefs.constraints}
        onChangeDraft={() => {}}
      />
    </div>
  );
}

describe("Settings End-to-End UI, Persistence & Consumer Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    currentMockSearch = {};
    navSearchListeners.clear();
  });

  it("maps all 7 categories and preserves backward-compatible ?section= legacy redirects", () => {
    const validate = SettingsRoute.options.validateSearch as (
      s: Record<string, unknown>,
    ) => { section?: string | undefined };

    expect(validate({ section: "navigation" })).toEqual({ section: "daily" });
    expect(validate({ section: "privacy" })).toEqual({ section: "system" });
    expect(validate({ section: "daily" })).toEqual({ section: "daily" });
    expect(validate({ section: "unknown" })).toEqual({ section: undefined });
  });

  it("opens all 7 settings sections cleanly with responsive mobile & desktop controls", () => {
    const { container } = render(
      <OSProvider>
        <StatefulSettingsHarness />
      </OSProvider>,
    );

    const nav = screen.getByRole("navigation", { name: "Settings Categories" });
    const buttons = within(nav).getAllByRole("button");
    expect(buttons).toHaveLength(7);

    // 1. Profile & Identity (default active)
    expect(
      screen.getByRole("heading", { name: "Profile & Identity" }),
    ).toBeInTheDocument();

    // 2. Appearance (no decorative cards)
    fireEvent.click(within(nav).getByText("Appearance"));
    expect(
      screen.getByRole("heading", { name: "Appearance" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Adaptive Glass")).not.toBeInTheDocument();

    // 3. Workspace Preferences (no operational priority/goals CRUD)
    fireEvent.click(within(nav).getByText("Workspace Preferences"));
    expect(
      screen.getByRole("heading", { name: "Workspace Preferences" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Three Permanent Priorities"),
    ).not.toBeInTheDocument();

    // 4. Daily Preferences
    fireEvent.click(within(nav).getByText("Daily Preferences"));
    expect(
      screen.getByRole("heading", { name: "Daily Preferences" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Time Zone")).toBeInTheDocument();
    expect(screen.getByText("Week Start Day")).toBeInTheDocument();

    // 5. Notifications (honest empty state, zero fake toggles/cards)
    fireEvent.click(within(nav).getByText("Notifications"));
    expect(
      screen.getByText("Push and audio reminders are not active yet"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByText("Timer Completion")).not.toBeInTheDocument();

    // 6. Data & Storage
    fireEvent.click(within(nav).getByText("Data & Storage"));
    expect(
      screen.getByRole("heading", { name: "Data & Storage" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Export Backup/i }),
    ).toBeInTheDocument();

    // 7. System & Privacy (accurate disclosures, no service-worker fiction)
    fireEvent.click(within(nav).getByText("System & Privacy"));
    expect(
      screen.getByRole("heading", { name: "System & Privacy" }),
    ).toBeInTheDocument();
    expect(container.textContent).not.toContain("browser service workers");

    // Mobile section active renders mobile Back button
    expect(
      screen.getByRole("button", { name: /All Settings Categories/i }),
    ).toBeInTheDocument();
  });

  it("persists Profile name, Appearance theme, Workspace & Daily settings across full OSProvider reload and reaches consumers", () => {
    const { unmount } = render(
      <OSProvider>
        <StatefulSettingsHarness />
      </OSProvider>,
    );

    // Reject blank name
    const nameInput = screen.getByLabelText("Display Name");
    fireEvent.change(nameInput, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));
    expect(
      screen.getByText("Display name cannot be empty."),
    ).toBeInTheDocument();

    // Save valid name
    fireEvent.change(nameInput, { target: { value: "Yash Tyagi" } });
    fireEvent.click(screen.getByRole("button", { name: "Save Name" }));

    // Switch Appearance to light theme and confirm html class toggle
    const nav = screen.getByRole("navigation", { name: "Settings Categories" });
    fireEvent.click(within(nav).getByText("Appearance"));
    fireEvent.click(screen.getByRole("radio", { name: /White Theme/i }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);

    // Update Workspace Preferences (reject empty North Star, then save valid vision)
    fireEvent.click(within(nav).getByText("Workspace Preferences"));
    const northStarInput = screen.getByLabelText("North Star (Concise Vision)");
    fireEvent.change(northStarInput, { target: { value: "  " } });
    fireEvent.click(
      screen.getByRole("button", { name: "Save Workspace Preferences" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /North Star concise vision cannot be empty/i,
    );
    fireEvent.change(northStarInput, {
      target: { value: "Ship resilient systems." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save Workspace Preferences" }),
    );

    // Update Daily Preferences (reject out-of-range hour, then save valid values)
    fireEvent.click(within(nav).getByText("Daily Preferences"));
    const collegeHoursInput = screen.getByLabelText("College Day");
    fireEvent.change(collegeHoursInput, { target: { value: "25" } });
    fireEvent.submit(collegeHoursInput.closest("form")!);
    expect(screen.getByRole("alert")).toHaveTextContent(/between 0 and 16/i);

    fireEvent.change(collegeHoursInput, { target: { value: "5.5" } });
    fireEvent.click(screen.getByRole("radio", { name: "Sunday" }));
    fireEvent.change(screen.getByLabelText("Personal Operating Constraints"), {
      target: { value: "Deep work only before 12:00." },
    });
    fireEvent.click(screen.getByLabelText(/Show Execution Timer/i));
    fireEvent.click(
      screen.getByRole("button", { name: "Save Daily Preferences" }),
    );

    // Unmount and remount fresh OSProvider to verify true localStorage reload persistence
    unmount();

    render(
      <OSProvider>
        <AppShell>
          <ConsumerInspectionProbe />
        </AppShell>
      </OSProvider>,
    );

    expect(screen.getByTestId("probe-name")).toHaveTextContent("Yash Tyagi");
    expect(screen.getByTestId("probe-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(screen.getByTestId("probe-week-start")).toHaveTextContent("0");
    expect(screen.getByTestId("probe-timer")).toHaveTextContent("false");
    expect(screen.getByTestId("probe-constraints")).toHaveTextContent(
      "Deep work only before 12:00.",
    );
    expect(
      screen.getByText("Personal Operating Constraints"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Deep work only before 12:00.")).toHaveLength(2);
    expect(screen.getByText("Ship resilient systems.")).toBeInTheDocument();
    // Initials in AppShell ProfileAvatar reflect updated name ("YT")
    expect(screen.getByText("YT")).toBeInTheDocument();
  });

  it("rejects malformed backups without mutating state, confirms valid restores, and executes v5 factory reset", async () => {
    const customSaved = {
      ...initialState,
      schemaVersion: 5,
      userName: "Preserve Me",
    };
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(customSaved));
    currentMockSearch = { section: "data" };

    render(
      <OSProvider>
        <StatefulSettingsHarness />
      </OSProvider>,
    );

    const fileInput = screen.getByLabelText(
      "Import backup file",
    ) as HTMLInputElement;

    // Upload invalid JSON structure ({})
    const badFile = new File(["{}"], "bad.json", { type: "application/json" });
    Object.defineProperty(badFile, "text", {
      value: async () => "{}",
    });
    fireEvent.change(fileInput, { target: { files: [badFile] } });

    expect(
      await screen.findByText(/Backup structure is invalid/i),
    ).toBeInTheDocument();
    expect(localStorage.getItem(PRIMARY_STORAGE_KEY)).toContain("Preserve Me");

    // Upload valid backup snapshot (including P3 storage and active inquiry) -> triggers explicit confirmation modal
    const validPayload = JSON.stringify({
      ...initialState,
      schemaVersion: 5,
      userName: "Restored Founder",
      p3Storage: {
        schemaVersion: 1,
        knowledgeUnits: [{ id: "ku-restored-1", title: "Restored KU" }],
        questions: [],
        sessions: [],
      },
      p3ActiveInquiries: {
        [`${P3_ACTIVE_INQUIRY_PREFIX}human_understanding`]: {
          currentStep: "define_question",
          selectedField: "Neuroscience",
        },
      },
    });
    const goodFile = new File([validPayload], "good.json", {
      type: "application/json",
    });
    Object.defineProperty(goodFile, "text", {
      value: async () => validPayload,
    });
    fireEvent.change(fileInput, { target: { files: [goodFile] } });

    expect(
      await screen.findByText("Confirm Backup Restore?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Restored Founder")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm Restore" }));
    expect(localStorage.getItem(PRIMARY_STORAGE_KEY)).toContain(
      "Restored Founder",
    );
    expect(localStorage.getItem(P3_STORAGE_KEY)).toContain("ku-restored-1");
    expect(
      localStorage.getItem(`${P3_ACTIVE_INQUIRY_PREFIX}human_understanding`),
    ).toContain("define_question");

    // Execute factory reset via confirmation modal -> verifies schemaVersion 5 and clears P3 storage & active inquiries
    fireEvent.click(screen.getByRole("button", { name: /Reset Data/i }));
    fireEvent.click(
      screen.getByRole("button", { name: "Yes, Reset Everything" }),
    );
    const storedAfterReset = JSON.parse(
      localStorage.getItem(PRIMARY_STORAGE_KEY) || "{}",
    ) as { schemaVersion?: number; userName?: string };
    expect(storedAfterReset.schemaVersion).toBe(5);
    expect(storedAfterReset.userName).toBe("Yash");
    expect(localStorage.getItem(P3_STORAGE_KEY)).toBeNull();
    expect(
      localStorage.getItem(`${P3_ACTIVE_INQUIRY_PREFIX}human_understanding`),
    ).toBeNull();
  });
});
