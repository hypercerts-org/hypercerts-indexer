import { parseAttestedEvent } from "../../src/parsing/parseAttestedEvent.js";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { getAddress } from "viem";
import { faker } from "@faker-js/faker";
import { Block } from "@hypercerts-org/chainsauce";
import { chainId } from "../../src/utils/constants.js";

const mocks = vi.hoisted(() => {
  return {
    fetchAttestationData: vi.fn(),
    readContract: vi.fn(),
  };
});

vi.mock("../../src/fetching/fetchAttestationData", () => ({
  fetchAttestationData: mocks.fetchAttestationData,
}));

describe("parseAttestedEvent", () => {
  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal(64) as `0x${string}`,
    timestamp: faker.number.int(),
  };

  const context = {
    block,
    schema: {
      id: "0xdef0",
      schema:
        "uint256 chain_id,address contract_address,uint256 token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags",
    },
    event_name: "TransferSingle",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
    readContract: mocks.readContract,
  };

  let event = {};

  // EAS on Sepolia
  const easContractAddress = getAddress(
    "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
  );
  const recipient = getAddress(faker.finance.ethereumAddress());
  const attester = getAddress(faker.finance.ethereumAddress());

  const mockAttestation = {
    uid: faker.string.hexadecimal({ length: 64 }),
    schema: "0xdef0",
    time: 1234567890n,
    expirationTime: 1234567890n,
    revocationTime: 1234567890n,
    refUID: faker.string.hexadecimal({ length: 64 }),
    recipient,
    attester,
    revocable: true,
    data: "0x0000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000a16dfb32eb140a6f3f2ac68f41dad8c7e83c494100000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000001600000000000000000000000000000000000000000000000000000000000000012436f6d6d656e747320676f6573206865726500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000474616731000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004746167320000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000047461673300000000000000000000000000000000000000000000000000000000",
  };

  beforeEach(() => {
    event = {
      address: easContractAddress,
      params: {
        recipient,
        attester,
        uid: "abcdef",
        schema: "0xdef0",
      },
      blockNumber: 1234n,
    };
  });

  it("returns undefined when contract address is invalid", async () => {
    event = { ...event, address: "0xinvalid" };
    await expect(() =>
      parseAttestedEvent({ event, context }),
    ).rejects.toThrowError();
  });

  it("returns undefined when contract address does not match easAddress", async () => {
    event = { ...event, address: "0x0000000000000000000000000000000000000000" };
    await expect(() =>
      parseAttestedEvent({ event, context }),
    ).rejects.toThrowError();
  });

  it("returns a parsed event object when log is valid", async () => {
    mocks.readContract.mockResolvedValue(mockAttestation);

    const [attestation] = await parseAttestedEvent({ event, context });
    expect(attestation).toBeDefined();
    expect(attestation.attester).toEqual(attester);
    expect(attestation.uid).toEqual(mockAttestation.uid);
  });
});
