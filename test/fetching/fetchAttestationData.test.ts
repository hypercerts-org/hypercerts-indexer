import { afterAll, afterEach, describe, test } from "vitest";
import {
  Attestation,
  fetchAttestationData,
} from "@/fetching/fetchAttestationData";
import { client } from "@/clients/evmClient";
import { faker } from "@faker-js/faker";
import sinon from "sinon";
import { getAddress } from "viem";

describe("fetchAttestationData", () => {
  afterEach(() => {
    sinon.restore();
  });

  afterAll(() => {
    sinon.restore();
  });

  test("returns undefined when attestedEvent is not provided", async ({
    expect,
  }) => {
    const result = await fetchAttestationData({});
    expect(result).toBeUndefined();
  });

  test("returns undefined when attestedEvent.uid is not provided", async ({
    expect,
  }) => {
    const result = await fetchAttestationData({ attestedEvent: {} });
    expect(result).toBeUndefined();
  });

  test("returns attestation data when attestedEvent and uid are provided", async ({
    expect,
  }) => {
    const recipient = getAddress(faker.finance.ethereumAddress());
    const attester = getAddress(faker.finance.ethereumAddress());

    const attestedEvent = {
      recipient,
      attester,
      uid: "0x1234",
      block_timestamp: BigInt(1234),
    };

    const mockAttestationData: Attestation = {
      uid: "0x1234",
      schema: "0x1234",
      refUID: "0x1234",
      time: BigInt(1234),
      expirationTime: BigInt(1234),
      revocationTime: BigInt(1234),
      recipient,
      revocable: true,
      attester,
      data: "0x1234",
    };
    const readSpy = sinon.stub(client, "readContract");
    readSpy.resolves(mockAttestationData);

    const result = await fetchAttestationData({
      attestedEvent,
    });

    expect(result).toEqual({
      ...attestedEvent,
      attestation: mockAttestationData,
    });
  });

  test("returns undefined when an error occurs during contract read", async ({
    expect,
  }) => {
    const recipient = getAddress(faker.finance.ethereumAddress());
    const attester = getAddress(faker.finance.ethereumAddress());

    const attestedEvent = {
      recipient,
      attester,
      uid: "0x1234",
      block_timestamp: BigInt(1234),
    };

    const readSpy = sinon.stub(client, "readContract");
    readSpy.throws();

    const result = await fetchAttestationData({
      attestedEvent,
    });

    expect(result).toBeUndefined();
  });
});
