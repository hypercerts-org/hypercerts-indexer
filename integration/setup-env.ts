import { alchemyApiKey } from "../src/utils/constants";
import { pool, testClient } from "../test/helpers/evm";
import { afterAll, afterEach } from "vitest";
import { fetchLogs } from "@viem/anvil";

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

// @ts-expect-error BigInt is not supported by JSON
BigInt.prototype.fromJSON = function () {
  const int = Number.parseInt(this.toString());
  return int ?? this.toString();
};

afterAll(async () => {
  await testClient.reset({
    jsonRpcUrl: `https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
    blockNumber: 4421945n,
  });
});

afterEach(async (context) => {
  context.onTestFailed(async () => {
    const logs = await fetchLogs("http://localhost:8545", pool);
    console.log(...logs.slice(-20));
  });
});
