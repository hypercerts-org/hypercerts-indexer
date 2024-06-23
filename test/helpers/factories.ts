import { faker } from "@faker-js/faker";
import { ClaimStoredEvent } from "../../src/parsing/claimStoredEvent";
import { getAddress, Hex } from "viem";
import { EasAttestation } from "../../src/fetching/fetchAttestationData";
import { SchemaRecord } from "../../src/fetching/fetchSchemaData";
import { Tables } from "../../src/types/database.types";
import { ParsedAttestedEvent } from "../../src/parsing/attestedEvent";
import { easAttestation } from "./data";
import { Claim } from "../../src/storage/storeClaim";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { EventToFetch } from "../../src/types/types";

export const generateClaim = (overrides?: Partial<Claim>): Claim => {
  return {
    contracts_id: faker.string.uuid(),
    creator_address: getAddress(faker.finance.ethereumAddress()),
    owner_address: getAddress(faker.finance.ethereumAddress()),
    token_id: faker.number.bigInt(),
    creation_block_number: faker.number.bigInt(),
    creation_block_timestamp: faker.number.bigInt(),
    last_update_block_timestamp: faker.number.bigInt(),
    last_update_block_number: faker.number.bigInt(),
    units: faker.number.bigInt(),
    uri: faker.internet.url(),
    ...overrides,
  };
};

export const generateClaimStoredEvent = (
  overrides?: Partial<ClaimStoredEvent>,
): ClaimStoredEvent => {
  return {
    address: getAddress(faker.finance.ethereumAddress()),
    blockNumber: faker.number.bigInt(),
    transactionHash: faker.string.hexadecimal({ length: 64 }) as Hex,
    args: {
      uri: faker.internet.url(),
      claimID: faker.number.bigInt(),
      totalUnits: faker.number.bigInt(),
    },
    ...overrides,
  };
};

export const generateEasAttestation = (overrides?: Partial<EasAttestation>) => {
  return {
    uid: faker.string.hexadecimal({ length: 66 }) as Hex,
    schema: faker.string.hexadecimal({ length: 66 }) as Hex,
    refUID: faker.string.hexadecimal({ length: 66 }) as Hex,
    time: faker.number.bigInt(),
    expirationTime: faker.number.bigInt(),
    revocationTime: faker.number.bigInt(),
    recipient: getAddress(faker.finance.ethereumAddress()),
    revocable: true,
    attester: getAddress(faker.finance.ethereumAddress()),
    data: easAttestation.data,
    ...overrides,
  };
};

export const generateEasSchemaRecord = (overrides?: Partial<SchemaRecord>) => {
  return {
    uid: faker.string.hexadecimal({ length: 66 }) as Hex,
    schema: easAttestation.schema,
    resolver: getAddress(faker.finance.ethereumAddress()),
    revocable: true,
    ...overrides,
  };
};

export const generateParsedAttestedEvent = (
  overrides?: Partial<ParsedAttestedEvent>,
) => {
  return {
    attester: getAddress(faker.finance.ethereumAddress()),
    recipient: getAddress(faker.finance.ethereumAddress()),
    uid: faker.string.hexadecimal({ length: 66 }) as Hex,
    creation_block_number: faker.number.bigInt(),
    creation_block_timestamp: faker.number.bigInt(),
    ...overrides,
  };
};

export const generateSupportedSchema = (
  overrides?: Partial<Tables<"supported_schemas">>,
) => {
  return {
    id: faker.string.hexadecimal({ length: 66 }) as Hex,
    schema: easAttestation.schema,
    ...overrides,
  };
};

interface GenerateAllowListOverrides {
  entries?: number;
}

export const generateAllowList = (overrides?: GenerateAllowListOverrides) => {
  const entries = overrides?.entries ?? 42;

  const allowListEntries = Array.from({ length: entries }, () => [
    faker.finance.ethereumAddress(),
    faker.number.bigInt(),
  ]);

  const tree = StandardMerkleTree.of(allowListEntries, ["address", "uint256"]);

  return tree;
};

export const generateEventToFetch = (overrides?: Partial<EventToFetch>) => {
  return {
    contracts_id: faker.string.uuid(),
    contract_address: getAddress(faker.finance.ethereumAddress()),
    events_id: faker.string.uuid(),
    event_name: faker.hacker.noun(),
    abi: faker.random.words(),
    last_block_indexed: faker.number.bigInt(),
    contract_slug: "minter-contract",
    start_block: faker.number.bigInt(),
    ...overrides,
  };
};
