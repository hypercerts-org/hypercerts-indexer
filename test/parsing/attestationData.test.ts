import { expect, it, beforeEach, describe } from "vitest";
import { decodeAttestationData } from "../../src/parsing/attestationData";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent";
import { Tables } from "@/types/database.types";
import { EasAttestation } from "../../src/fetching/fetchAttestationData";
import { faker } from "@faker-js/faker";
import { Address, getAddress } from "viem";
import { chainId } from "../../src/utils/constants";
import {
  generateEasAttestation,
  generateParsedAttestedEvent,
  generateSupportedSchema,
} from "../helpers/factories";

describe("decodeAttestationData", () => {
  let attester: Address;
  let recipient: Address;
  let event = {} as ParsedAttestedEvent;
  let attestation: EasAttestation;
  let schema: Pick<Tables<"supported_schemas">, "schema" | "id">;

  beforeEach(() => {
    attester = getAddress(faker.finance.ethereumAddress());
    recipient = getAddress(faker.finance.ethereumAddress());

    event = generateParsedAttestedEvent({
      attester,
      recipient,
    });

    attestation = generateEasAttestation({
      attester,
      recipient,
    });

    schema = generateSupportedSchema();
  });

  it("returns undefined when schema is incomplete", () => {
    schema.schema = null;
    expect(
      decodeAttestationData({ attestation, event, schema }),
    ).toBeUndefined();
  });

  it("returns undefined when attestation can't be parsed or is missing", () => {
    const result = decodeAttestationData({
      attestation: {} as EasAttestation,
      event,
      schema,
    });
    expect(result).toBeUndefined();
  });

  it("returns undefined when attestation data cannot be parsed", () => {
    attestation.data = "0xinvalid";
    const result = decodeAttestationData({ attestation, event, schema });
    expect(result).toBeUndefined();
  });

  it("returns a new attestation object with decoded data when attestation data is valid", () => {
    const result = decodeAttestationData({ attestation, event, schema });
    expect(result).toBeDefined();
    expect(result).toMatchObject({
      attester,
      recipient,
      block_timestamp: event.block_timestamp,
      uid: attestation.uid,
      supported_schemas_id: schema.id,
      attestation: JSON.parse(JSON.stringify(attestation)),
      chain_id: BigInt(chainId),
      token_id: 146321417776003539289251081195660330926080n,
      contract_address: getAddress(
        "0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941",
      ),
    });
  });
});
