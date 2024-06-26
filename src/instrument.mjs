import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export const assertExists = (variable, name) => {
  if (!variable) {
    throw new Error(`Environment variable ${name} is not set.`);
  }

  return variable;
};

const enabled =
  process.env.SENTRY_ENVIRONMENT === "production" ||
  process.env.SENTRY_ENVIRONMENT === "staging";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: enabled ? assertExists(process.env.SENTRY_DSN, "SENTRY_DSN") : undefined,
  integrations: [nodeProfilingIntegration()],
  enabled,

  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});
