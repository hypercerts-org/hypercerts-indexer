import { afterAll, afterEach, beforeEach, describe, test } from "vitest";
import {
  FetchAttestationData,
  fetchAttestationData,
} from "@/fetching/fetchAttestationData";
import { client } from "@/clients/evmClient";
import { faker } from "@faker-js/faker";
import sinon from "sinon";
import { getAddress } from "viem";
import { ParsedAttestedEvent } from "../../src/parsing/attestedEvent";
import { generateEasAttestation } from "../helpers/factories";

describe("fetchAttestationData", () => {
  const readSpy = sinon.stub(client, "readContract");

  let attestedEvent = {} as ParsedAttestedEvent;
  const mockAttestationData = generateEasAttestation();

  beforeEach(() => {
    attestedEvent = {
      attester: getAddress(faker.finance.ethereumAddress()),
      recipient: getAddress(faker.finance.ethereumAddress()),
      uid: faker.string.hexadecimal({ length: 32 }),
      block_timestamp: 1234567890n,
    };
  });

  afterEach(() => {
    sinon.reset();
  });

  afterAll(() => {
    sinon.restore();
  });

  test("throws when attestedEvent is not provided", async ({ expect }) => {
    await expect(() =>
      fetchAttestationData({} as FetchAttestationData),
    ).rejects.toThrowError();
  });

  test("throws when attestedEvent.uid is not provided", async ({ expect }) => {
    await expect(() =>
      fetchAttestationData({
        attestedEvent: {} as unknown as ParsedAttestedEvent,
      }),
    ).rejects.toThrowError();
  });

  test("returns attestation data when attestedEvent and uid are provided", async ({
    expect,
  }) => {
    readSpy.resolves(mockAttestationData);

    const result = await fetchAttestationData({
      attestedEvent,
    });

    expect(result).toEqual({
      event: attestedEvent,
      attestation: mockAttestationData,
    });
  });

  test("throws when an error occurs during contract read", async ({
    expect,
  }) => {
    readSpy.throws();

    await expect(() =>
      fetchAttestationData({ attestedEvent }),
    ).rejects.toThrowError();
  });
});
