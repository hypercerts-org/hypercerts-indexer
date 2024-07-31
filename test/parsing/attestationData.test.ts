import { expect, it, beforeEach, describe } from "vitest";
import { parseAttestationData } from "../../src/parsing/parseAttestationData.js";
import { Tables } from "@/types/database.types.js";
import { faker } from "@faker-js/faker";
import { Address, getAddress } from "viem";
import { chainId } from "@/utils/constants.js";
import {
  generateEasAttestation,
  generateParsedAttestedEvent,
  generateSupportedSchema,
} from "../helpers/factories.js";
import { EasAttestation } from "../../src/parsing/parseAttestedEvent.js";

describe("decodeAttestationData", () => {
  let attester: Address;
  let recipient: Address;
  let event;
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

  it("throws when schema is incomplete", () => {
    schema.schema = null;
    expect(() =>
      parseAttestationData({ attestation, event, schema }),
    ).toThrowError();
  });

  it("throws when attestation schema can't be parsed or is missing", () => {
    expect(() =>
      parseAttestationData({
        attestation: {},
        event,
        schema,
      }),
    ).toThrowError();
  });

  it("throws when attestation data cannot be parsed", () => {
    attestation.data = "0xinvalid";
    expect(() =>
      parseAttestationData({ attestation, event, schema }),
    ).toThrowError();
  });

  it("returns a new attestation object with decoded data when attestation data is valid", () => {
    const result = parseAttestationData({ attestation, event, schema });
    expect(result).toBeDefined();
    expect(result).toMatchObject({
      attester,
      recipient,
      uid: attestation.uid,
      supported_schemas_id: schema.id,
      attestation,
      chain_id: BigInt(chainId),
      token_id: 146321417776003539289251081195660330926080n,
      contract_address: getAddress(
        "0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941",
      ),
      data: {
        chain_id: 11155111,
        comments: "Just evaluating.",
        contract_address: "0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941",
        evaluate_basic: 1,
        evaluate_contributors: 1,
        evaluate_properties: 1,
        evaluate_work: 1,
        tags: ["salad", "steak", "sauce", "ketchup"],
        token_id: "146321417776003539289251081195660330926080",
      },
    });

    // expect(result).toMatchObject({
    //   attester,
    //   recipient,
    //   uid: attestation.uid,
    //   supported_schemas_id: schema.id,
    //   attestation: JSON.parse(JSON.stringify(attestation)),
    //   chain_id: BigInt(chainId),
    //   token_id: 146321417776003539289251081195660330926080n,
    //   contract_address: getAddress(
    //     "0xa16dfb32eb140a6f3f2ac68f41dad8c7e83c4941",
    //   ),
    // });
  });
});
