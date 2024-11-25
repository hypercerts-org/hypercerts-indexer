import { describe, it, expect, beforeEach } from "vitest";
import { storeTransferSingle } from "../../src/storage/storeTransferSingle.js";
import { faker } from "@faker-js/faker";
import { server } from "../setup-env.js";
import { http, HttpResponse } from "msw";
import { supabaseUrl } from "../../src/utils/constants.js";
import { getAddress } from "viem";
import { Block } from "@hypercerts-org/chainsauce";
import { getEvmClient } from "../../src/clients/evmClient.js";

describe("storeTransferSingleFraction", () => {
  const chainId = 11155111;
  const client = getEvmClient(chainId);

  const block: Block = {
    chainId,
    blockNumber: faker.number.bigInt(),
    blockHash: faker.string.hexadecimal({ length: 64 }) as `0x${string}`,
    timestamp: faker.date.past().getTime(),
  };

  const context = {
    block,
    event_name: "TransferSingle",
    chain_id: chainId,
    events_id: faker.string.uuid(),
    contracts_id: faker.string.uuid(),
  };

  const transfer = {
    contract_address: getAddress(faker.finance.ethereumAddress()),
    value: faker.number.bigInt(),
    from_owner_address: getAddress(faker.finance.ethereumAddress()),
    to_owner_address: getAddress(faker.finance.ethereumAddress()),
    token_id: 420n,
    contracts_id: faker.string.uuid(),
    type: "fraction",
  };

  beforeEach(() => {
    server.use(
      http.get(`${supabaseUrl}/*`, async () => {
        return HttpResponse.json({
          id: faker.string.uuid(),
          claims_id: faker.string.uuid(),
          token_id: transfer.token_id.toString(),
        });
      }),
      http.post(`${supabaseUrl}/*`, async () => {
        return HttpResponse.json({
          id: faker.string.uuid(),
          claims_id: faker.string.uuid(),
          token_id: transfer.token_id.toString(),
        });
      }),
    );
  });

  it("should store the fraction tokens", async () => {
    const requests = await storeTransferSingle({
      data: [transfer],
      context,
    });

    expect(requests.length).toBe(1);
  });
});
