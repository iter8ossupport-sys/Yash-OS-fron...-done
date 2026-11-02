/**
 * Yash OS Client-Side Error Reporting & Telemetry Bridge
 *
 * Captures uncaught React error boundary exceptions and client-side runtime anomalies.
 * Forwards diagnostics to developer telemetry hooks (such as Lovable preview or custom loggers)
 * when available, while operating as a safe zero-overhead no-op in standalone production.
 */

export type ClientErrorOptions = {
  mechanism?:
    "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export type ClientTelemetryEvents = {
  track?: (
    event: string,
    properties?: Record<string, unknown>,
  ) => string | null;
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: ClientErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: ClientTelemetryEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

const MAX_SERIALIZED_LENGTH = 2000;

function describeThrown(error: unknown): string {
  if (error instanceof Response) {
    return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  const { message } = (error ?? {}) as { message?: unknown };
  if (typeof message === "string" && message.length > 0) return message;
  try {
    return (
      JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error)
    );
  } catch {
    return String(error);
  }
}

/**
 * Report a client-side error to available telemetry bridges.
 */
export function reportClientError(
  error: unknown,
  context: Record<string, unknown> = {},
) {
  if (typeof window === "undefined") return;

  // Standard telemetry exception dispatch
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );

  // Development preview error bridge
  const stack = error instanceof Error ? error.stack : undefined;
  window.__lovableReportRuntimeError?.({
    message: describeThrown(error),
    ...(stack !== undefined && { stack }),
    filename: window.location.pathname,
  });
}

// Backward-compatible alias for existing imports and tooling
export const reportLovableError = reportClientError;
