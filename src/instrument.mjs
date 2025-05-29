import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const env = process.env.SENTRY_ENVIRONMENT;

// Ensure to call this before importing any other modules!
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
    Sentry.captureConsoleIntegration({ levels: ["warn", "error"] }),
  ],
  enabled: env === "production" || env === "staging",
  // Add Tracing by setting tracesSampleRate
  // We recommend adjusting this value in production
  tracesSampleRate: env === "production" ? 0.1 : 1.0,

  // Set sampling rate for profiling
  // This is relative to tracesSampleRate
  profilesSampleRate: env === "production" ? 0.1 : 1.0,
});
