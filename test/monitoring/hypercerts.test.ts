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
  const createEventFilterSpy = sinon.stub(client, "createEventFilter");
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

  it("throws when minter address is not available", async () => {
    // getMinterAddress will throw when getDeployment returns null
    mocks.getDeployment.mockReturnValue({ addresses: null, startBlock: 0n });

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          fromBlock: 100n,
          contractEvent: eventToFetch,
        }),
    ).rejects.toThrowError(
      "[getMinterAddressAndStartBlock] HypercertMinterUUPS is not available",
    );
  });

  it("throws when block number is not available", async () => {
    // getBlocksToFetch will throw when client cannot get block number
    getBlockNumberSpy.throws();

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          fromBlock: 100n,
          contractEvent: eventToFetch,
        }),
    ).rejects.toThrowError();
  });

  it("throws when event filter cannot be created", async () => {
    // createEventFilter will throw when client cannot create event filter
    getBlockNumberSpy.resolves(100n);
    createEventFilterSpy.throws();

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          fromBlock: 100n,
          contractEvent: eventToFetch,
        }),
    ).rejects.toThrowError();
  });

  it("throws when ABI cannot be parsed", async () => {
    // parseAbiItem will throw when ABI cannot be parsed
    getBlockNumberSpy.resolves(100n);

    await expect(
      async () =>
        await getLogsForContractEvents({
          batchSize: 100n,
          fromBlock: 100n,
          contractEvent: { ...eventToFetch, abi: "" },
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

    getBlockNumberSpy.resolves(5957292n);
    //@ts-expect-error createEventFilterSpy is a Sinon spy
    createEventFilterSpy.resolves(claimStoredEventFilter);
    //@ts-expect-error getFilterLogsSpy is a Sinon spy
    getFilterLogsSpy.resolves(claimStoredEventLog);

    const result = await getLogsForContractEvents({
      batchSize: 100n,
      fromBlock: 100n,
      contractEvent: {
        ...eventToFetch,
        contract_address:
          "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
        event_name: "ClaimStored",
        abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
      },
    });

    expect(result).toEqual({
      logs: claimStoredEventLog,
      fromBlock: 5957292n,
      toBlock: 5957292n,
    });
  });

  it("throws when logs cannot be fetched", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      addresses: {
        HypercertMinterUUPS: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
      },
    });

    getBlockNumberSpy.resolves(5957292n);
    //@ts-expect-error createEventFilterSpy is a Sinon spy
    createEventFilterSpy.resolves(claimStoredEventFilter);
    getFilterLogsSpy.throws();

    await expect(async () => {
      await getLogsForContractEvents({
        batchSize: 100n,
        fromBlock: 100n,
        contractEvent: {
          ...eventToFetch,
          contract_address:
            "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941" as `0x${string}`,
          event_name: "ClaimStored",
          abi: "event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)",
        },
      });
    }).rejects.toThrowError();
  });
});
