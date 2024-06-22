import { parseAttestedEvent } from "../../src/parsing/attestedEvent";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { getAddress } from "viem";
import { faker } from "@faker-js/faker";

const mocks = vi.hoisted(() => {
  return {
    getDeployment: vi.fn(),
    getBlockTimestamp: vi.fn(),
  };
});

vi.mock("../../src/utils/getDeployment", () => ({
  getDeployment: mocks.getDeployment,
}));

vi.mock("../../src/utils/getBlockTimestamp", () => ({
  getBlockTimestamp: mocks.getBlockTimestamp,
}));

describe("parseAttestedEvent", () => {
  let log = {};

  const easContractAddress = getAddress(faker.finance.ethereumAddress());
  const recipient = getAddress(faker.finance.ethereumAddress());
  const attester = getAddress(faker.finance.ethereumAddress());

  beforeEach(() => {
    log = {
      address: easContractAddress,
      args: {
        recipient,
        attester,
        uid: "abcdef",
        schema: "0xdef0",
      },
      blockNumber: 1234n,
    };
  });

  it("returns undefined when contract address is invalid", async () => {
    log = { ...log, address: "0xinvalid" };
    await expect(() => parseAttestedEvent(log)).rejects.toThrowError();
  });

  it("returns undefined when contract address does not match easAddress", async () => {
    log = { ...log, address: "0x0000000000000000000000000000000000000000" };
    await expect(() => parseAttestedEvent(log)).rejects.toThrowError();
  });

  it("returns a parsed event object when log is valid", async () => {
    mocks.getDeployment.mockReturnValue({ easAddress: easContractAddress });
    mocks.getBlockTimestamp.mockReturnValue(1234567890n);

    const result = await parseAttestedEvent(log);
    expect(result).toBeDefined();
    expect(result.recipient).toEqual(recipient);
    expect(result.attester).toEqual(attester);
    expect(result.uid).toEqual("abcdef");
    expect(result.creation_block_timestamp).toEqual(1234567890n);
  });
});
