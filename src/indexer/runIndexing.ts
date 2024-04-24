import { IndexerConfig } from "@/types/types";

let isRunning = false;

/*
 * Utility function to run indexing method with a delay. When the method is running, it will skip the next interval.
 *
 * @param indexingMethod - method to run
 * @param delay - delay in milliseconds
 * @param args - arguments to pass to the indexing method
 * @returns void
 *
 * @example
 * ```js
 * await runIndexing(indexingMethod, 1000, ...args);
 * ```
 *
 */
export const runIndexing = async (
  indexingMethods: ((config: IndexerConfig) => Promise<void>)[],
  delay: number,
  config?: IndexerConfig,
) => {
  if (isRunning) {
    console.debug("[runIndexing] Batch already running, skipping interval.");
    return;
  }

  isRunning = true;

  try {
    for (const indexingMethod of indexingMethods) {
      await indexingMethod({});
    }
  } catch (error) {
    console.error("[runIndexing] Failed to index events", error);
  } finally {
    isRunning = false;
    setTimeout(runIndexing, delay, indexingMethods, delay, config);
  }
};
