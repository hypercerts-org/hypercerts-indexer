let isRunning = false;

export const runIndexing = async (
  indexingMethod: (...args: any[]) => Promise<void>,
  delay: number,
  ...args: any[]
) => {
  if (isRunning) {
    console.info("A batch is currently running. Skipping this interval.");
    return;
  }

  isRunning = true;

  try {
    await indexingMethod(...args);
  } catch (error) {
    console.error("Failed to index claims stored events", error);
  } finally {
    isRunning = false;
    setTimeout(runIndexing, delay, indexingMethod, delay, ...args);
  }
};
