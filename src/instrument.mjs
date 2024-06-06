import * as Sentry from "@sentry/node";
import { assertExists } from "./utils/assertExists.js";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const enabled = process.env.SENTRY_ENVIRONMENT === "production" ||
  process.env.SENTRY_ENVIRONMENT === "staging";

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: enabled ? assertExists(process.env.SENTRY_DSN, "SENTRY_DSN") : undefined,
  integrations: [
    nodeProfilingIntegration()
  ],
  enabled,

  // Add Performance Monitoring by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});
