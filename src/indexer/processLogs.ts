import _ from "lodash";

export interface LogParser<T> {
  logs: unkown[];
  contracts_id: string;
  parsingMethod: (event: unknown) => Promise<T>;
  storageMethod: <T>(data: T[]) => Promise<void>;
}

export const processLogs = async <T>({
  logs,
  contracts_id,
  parsingMethod,
  storageMethod,
}: LogParser<T>) => {
  console.log(`Processing ${logs.length} logs`);
  // Split logs into chunks
  const logChunks = _.chunk(logs, 10);

  // Initialize an empty array to store all claims
  let allParsedLogs: T[] = [];

  // Process each chunk one by one
  for (const logChunk of logChunks) {
    const events = await Promise.all(logChunk.map(parsingMethod));

    const parsedLogs = events
      .filter((event) => event !== null && event !== undefined)
      .map((log) => ({
        ...log,
        contracts_id,
      }));

    // Add the claims from the current chunk to the allClaims array
    allParsedLogs = [...allParsedLogs, ...parsedLogs];
  }

  return await storageMethod<T>(allParsedLogs);
};
