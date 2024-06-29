import { getLogsForContractEvents } from "@/monitoring/hypercerts.js";
import { client } from "@/clients/evmClient.js";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import sinon from "sinon";
import { generateEventToFetch } from "../helpers/factories";
import { claimStoredEventFilter, claimStoredEventLog } from "../helpers/data";

const mocks = vi.hoisted(() => {
  return {
    getDeployment: vi.fn(),
  };
});

vi.mock("../../src/utils/getDeployment", () => ({
  getDeployment: mocks.getDeployment,
}));

describe("getLogsForContractEvents", () => {
  const getBlockNumberSpy = sinon.stub(client, "getBlockNumber");
  const createEventFilterSpy = sinon.stub(client, "createContractEventFilter");
  const getFilterLogsSpy = sinon.stub(client, "getFilterLogs");
  const eventToFetch = generateEventToFetch();

  beforeEach(() => {
    mocks.getDeployment.mockReturnValue({
      addresses: {
        HypercertMinterUUPS: "0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941",
      },
      startBlock: 0n,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
    sinon.reset();
  });

  afterAll(() => {
    vi.clearAllMocks();
    sinon.restore();
  });

  it("throws when block number is not available", async () => {
    // getBlocksToFetch will throw when client cannot get block number
    getBlockNumberSpy.throws();

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          contractEvent: eventToFetch,
        }),
    ).rejects.toThrowError();
  });

  it("throws when event filter cannot be created", async () => {
    // createEventFilter will throw when client cannot create event filter
    getBlockNumberSpy.resolves(102n);
    createEventFilterSpy.throws();

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          contractEvent: generateEventToFetch({
            last_block_indexed: 100n,
            start_block: 90n,
          }),
        }),
    ).rejects.toThrowError();
  });

  it("returns logs when all parameters are valid", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      addresses: {
        HypercertMinterUUPS: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
      },
    });

    const blockNumber = 1000n;

    getBlockNumberSpy.resolves(blockNumber);
    //@ts-expect-error createEventFilterSpy is a Sinon spy
    createEventFilterSpy.resolves(claimStoredEventFilter);
    //@ts-expect-error getFilterLogsSpy is a Sinon spy
    getFilterLogsSpy.resolves(claimStoredEventLog);

    const result = await getLogsForContractEvents({
      batchSize: 100n,
      contractEvent: {
        ...generateEventToFetch({
          last_block_indexed: blockNumber - 3n,
          start_block: blockNumber - 6n,
        }),
        contract_address:
          "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
        event_name: "ClaimStored",
        abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
      },
    });

    expect(result).toEqual({
      logs: claimStoredEventLog,
      fromBlock: blockNumber - 3n,
      toBlock: blockNumber,
    });
  });

  it("throws when logs cannot be fetched", async () => {
    const startBlock = 5957292n;
    mocks.getDeployment.mockReturnValue({
      startBlock,
      addresses: {
        HypercertMinterUUPS: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
      },
    });

    getBlockNumberSpy.resolves(startBlock + 3n);
    //@ts-expect-error createEventFilterSpy is a Sinon spy
    createEventFilterSpy.resolves(claimStoredEventFilter);
    getFilterLogsSpy.throws();

    await expect(async () => {
      await getLogsForContractEvents({
        batchSize: 100n,
        contractEvent: {
          ...generateEventToFetch({
            last_block_indexed: startBlock + 2n,
            start_block: startBlock,
          }),
          contract_address:
            "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
          event_name: "ClaimStored",
          abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
        },
      });
    }).rejects.toThrowError();
  });
});
