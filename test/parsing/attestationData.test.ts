import { expect, it, beforeEach, describe } from "vitest";
import { decodeAttestationData } from "../../src/parsing/attestationData";
import { ParsedAttestedEvent } from "@/parsing/attestedEvent";
import { Tables } from "@/types/database.types";
import { EasAttestation } from "../../src/fetching/fetchAttestationData";
import { getMockEasAttestation } from "../resources/mockAttestations";
import { faker } from "@faker-js/faker";
import { Address, getAddress } from "viem";
import { chainId } from "../../src/utils/constants";

describe("decodeAttestationData", () => {
  let attester: Address;
  let recipient: Address;
  let event = {} as ParsedAttestedEvent;
  let attestation: EasAttestation;
  let schema: Pick<Tables<"supported_schemas">, "schema" | "id">;

  beforeEach(() => {
    attester = getAddress(faker.finance.ethereumAddress());
    recipient = getAddress(faker.finance.ethereumAddress());

    event = {
      attester,
      recipient,
      uid: faker.string.hexadecimal({ length: 6 }),
      block_timestamp: BigInt(Math.round(faker.date.recent().getTime() / 1000)),
    };

    attestation = getMockEasAttestation({
      attester,
      recipient,
      data: "0x0000000000000000000000000000000000000000000000000000000000aa36a7000000000000000000000000a16dfb32eb140a6f3f2ac68f41dad8c7e83c494100000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000002a3134363332313431373737363030333533393238393235313038313139353636303333303932363038300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000104a757374206576616c756174696e672e000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000000573616c61640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005737465616b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005736175636500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000076b65746368757000000000000000000000000000000000000000000000000000",
    });

    schema = {
      schema: `uint40 chain_id,address contract_address,string token_id,uint8 evaluate_basic,uint8 evaluate_work,uint8 evaluate_contributors,uint8 evaluate_properties,string comments,string[] tags`,
      id: faker.string.hexadecimal({ length: 66, casing: "lower" }),
    };
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
