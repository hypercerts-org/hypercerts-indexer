import { beforeEach, describe, expect, it, vi } from "vitest";
import { supabase } from "../src/clients/supabaseClient";
import { anvilInstance, publicClient, testClient } from "../test/helpers/evm";
import { encodeAbiParameters } from "viem";
import { submitAttestTransaction } from "../test/helpers/transactions";
import { ZERO_ADDRESS } from "../src/utils/constants";
import { cleanupSupabase } from "./setup-env";
import { indexAttestations } from "../src/indexer/indexAttestations";
import { parseSchemaToABI } from "../src/utils/parseSchemaToAbi";
import { indexSupportedSchemas } from "../src/indexer/indexSupportedSchemas";

vi.mock("../src/clients/evmClient", () => {
  return {
    client: publicClient,
  };
});

describe("index attested events", async () => {
  const contractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
  const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";

  beforeEach(async () => {
    await cleanupSupabase();

    await anvilInstance.restart();
    await testClient.reset({ blockNumber: 6098992n });
  });

  it("observes and stores attested event", async () => {
    const { data: schema } = await supabase
      .from("supported_schemas")
      .select("*")
      .single();

    const encodingSchema = `uint256 chain_id, address contract_address, uint256 token_id, uint8 evaluate_basic, uint8 evaluate_work, uint8 evaluate_contributors, uint8 evaluate_properties, string comments, string[] tags`;
    const parsedSchema = parseSchemaToABI(encodingSchema);
    const chain_id = BigInt(publicClient.chain.id);
    const contract_address = contractAddress;
    const token_id = BigInt(1337);
    const evaluate_basic = 1n;
    const evaluate_work = 1n;
    const evaluate_contributors = 1n;
    const evaluate_properties = 1n;
    const comments = "test";
    const tags = ["test"];

    const encodedData = encodeAbiParameters(parsedSchema[0].outputs, [
      chain_id,
      contract_address,
      token_id,
      evaluate_basic,
      evaluate_work,
      evaluate_contributors,
      evaluate_properties,
      comments,
      tags,
    ]);

    const requestData = {
      recipient: ZERO_ADDRESS,
      revocable: false,
      expirationTime: 0n,
      data: encodedData,
    };

    const tx = await submitAttestTransaction({
      contractAddress,
      account,
      schemaUid: schema.uid,
      requestData,
    });

    await indexSupportedSchemas({ batchSize: 1000n });

    await publicClient.waitForTransactionReceipt({ hash: tx });

    await testClient.mine({ blocks: 5 });

    await indexAttestations({
      batchSize: 1000n,
    });

    const { data } = await supabase.from("attestations").select("*");

    console.log(data);
    expect(data?.length).toBe(1);
    expect(data?.[0].contract_address).toBe(contractAddress);
    expect(data?.[0].token_id.toString()).toBe(token_id.toString());
    expect(data?.[0].chain_id.toString()).toBe(chain_id.toString());
    expect(data?.[0].data.comments).toBe(comments);
    expect(data?.[0].data.tags).toStrictEqual(tags);
    expect(BigInt(data?.[0].data.evaluate_basic)).toBe(evaluate_basic);
    expect(BigInt(data?.[0].data.evaluate_work)).toBe(evaluate_work);
    expect(BigInt(data?.[0].data.evaluate_contributors)).toBe(
      evaluate_contributors,
    );
  });
});
