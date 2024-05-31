import { getAttestationsForSchema } from "@/monitoring/eas";
import { client } from "@/clients/evmClient";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import sinon from "sinon";
import { mockFilter, mockLogs } from "../resources/mockAttestations";

const mocks = vi.hoisted(() => {
  return {
    getDeployment: vi.fn(),
  };
});

vi.mock("../../src/utils/getDeployment", () => ({
  getDeployment: mocks.getDeployment,
}));

describe("getAttestationsForSchema", () => {
  const getBlockNumberSpy = sinon.stub(client, "getBlockNumber");
  const createEventFilterSpy = sinon.stub(client, "createEventFilter");
  const getFilterLogsSpy = sinon.stub(client, "getFilterLogs");

  afterEach(() => {
    vi.clearAllMocks();
    sinon.reset();
  });

  afterAll(() => {
    vi.clearAllMocks();
    sinon.restore();
  });

  it("returns undefined when EAS address is not available", async () => {
    mocks.getDeployment.mockReturnValue({ startBlock: 0n, easAddress: null });

    const result = await getAttestationsForSchema({
      schema: { uid: "0x123" },
      batchSize: 100n,
    });
    expect(result).toBeUndefined();
  });

  it("returns undefined when EAS address is not valid", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 0n,
      easAddress: "not an address",
    });

    const result = await getAttestationsForSchema({
      schema: { uid: "0x123" },
      batchSize: 100n,
    });
    expect(result).toBeUndefined();
  });

  it("returns logs when all parameters are valid", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      easAddress: "0xc2679fbd37d54388ce493f1db75320d236e1815e",
    });

    getBlockNumberSpy.resolves(5957292n);
    createEventFilterSpy.resolves(mockFilter);
    getFilterLogsSpy.resolves(mockLogs);

    const result = await getAttestationsForSchema({
      schema: {
        uid: "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      },
      batchSize: 100n,
    });

    expect(result).toEqual({
      logs: mockLogs,
      fromBlock: 5957292n,
      toBlock: 5957292n,
    });
  });

  it("returns undefined when block number is not available", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      easAddress: "0xc2679fbd37d54388ce493f1db75320d236e1815e",
    });

    getBlockNumberSpy.throws();

    const result = await getAttestationsForSchema({
      schema: {
        uid: "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      },
      batchSize: 100n,
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when event filter cannot be created", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      easAddress: "0xc2679fbd37d54388ce493f1db75320d236e1815e",
    });

    getBlockNumberSpy.resolves(5957292n);
    createEventFilterSpy.throws();

    const result = await getAttestationsForSchema({
      schema: {
        uid: "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      },
      batchSize: 100n,
    });

    expect(result).toBeUndefined();
  });

  it("returns undefined when logs cannot be fetched", async () => {
    mocks.getDeployment.mockReturnValue({
      startBlock: 5957292n,
      easAddress: "0xc2679fbd37d54388ce493f1db75320d236e1815e",
    });

    getBlockNumberSpy.resolves(5957292n);
    createEventFilterSpy.resolves(mockFilter);
    getFilterLogsSpy.throws();

    const result = await getAttestationsForSchema({
      schema: {
        uid: "0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f",
      },
      batchSize: 100n,
    });

    expect(result).toBeUndefined();
  });
});
