import express from "express";
import dotenv from "dotenv";

dotenv.config();

import { port, batchSize, delay } from "./utils/constants";
import { indexClaimsStoredEvents, runIndexing } from "./indexer";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import { captureConsoleIntegration } from "@sentry/integrations";

const app = express();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
    captureConsoleIntegration({
      levels: ["error"],
    }),
  ],
  enabled:
    process.env.SENTRY_ENVIRONMENT === "production" ||
    process.env.SENTRY_ENVIRONMENT === "staging",
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.get("/heartbeat", (req, res) => {
  res.status(200).send("OK");
});

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.listen(port, () => {
  console.log(`Indexer listening on port ${port}`);
  runIndexing(indexClaimsStoredEvents, delay, { batchSize });
});
