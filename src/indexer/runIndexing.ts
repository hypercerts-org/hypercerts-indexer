import { IndexerConfig } from "@/indexer/indexClaimsStored";

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
  indexingMethod: (config: IndexerConfig) => Promise<void>,
  delay: number,
  config: IndexerConfig,
) => {
  if (isRunning) {
    console.debug("Batch already running, skipping interval.");
    return;
  }

  isRunning = true;

  try {
    await indexingMethod(config);
  } catch (error) {
    console.error("Failed to index claims stored events", error);
  } finally {
    isRunning = false;
    setTimeout(runIndexing, delay, indexingMethod, delay, config);
  }
};
