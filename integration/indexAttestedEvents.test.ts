// import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
// import { supabase } from "../src/clients/supabaseClient";
// import { anvilInstance, publicClient, testClient } from "../test/helpers/evm";
// import { indexClaimsStoredEvents } from "../src/indexer/indexClaimsStored";
// import {
//   encodeAbiParameters,
//   getAddress,
//   parseAbiParameter,
//   parseEther,
// } from "viem";
// import { Tables } from "../src/types/database.types";
// import {
//   submitAttestTransaction,
//   submitMintClaimTransaction,
// } from "../test/helpers/transactions";
// import { ZERO_ADDRESS } from "../src/utils/constants";
// import { cleanupSupabase } from "./setup-env";
// import { indexAttestations } from "../src/indexer/indexAttestations";
// import { parseSchemaToABI } from "../src/utils/parseSchemaToAbi";
//
// vi.mock("../src/clients/evmClient", () => {
//   return {
//     client: publicClient,
//   };
// });
//
// describe("index attested events", async () => {
//   const contractAddress = "0xC2679fBD37d54388Ce493F1DB75320D236e1815e";
//   const account = "0xdf2C3dacE6F31e650FD03B8Ff72beE82Cb1C199A";
//   const units = parseEther("1");
//   const cid = "ipfs://test_cid";
//
//   beforeEach(async () => {
//     await cleanupSupabase();
//
//     await anvilInstance.restart();
//   });
//
//   it("observes and stores attested event", async () => {
//     const { data: schema } = await supabase
//       .from("supported_schemas")
//       .select("*")
//       .single();
//
//     const encodingSchema = `uint256 chain_id, address contract_address, uint256 token_id, uint8 evaluate_basic, uint8 evaluate_work, uint8 evaluate_contributors, uint8 evaluate_properties, string comments, string[] tags`;
//     const parsedSchema = parseSchemaToABI(encodingSchema);
//     const chain_id = BigInt(publicClient.chain.id);
//     const contract_address = contractAddress;
//     const token_id = BigInt(1337);
//     const evaluate_basic = 1n;
//     const evaluate_work = 1n;
//     const evaluate_contributors = 1n;
//     const evaluate_properties = 1n;
//     const comments = "test";
//     const tags = ["test"];
//
//     const encodedData = encodeAbiParameters(parsedSchema[0].outputs, [
//       chain_id,
//       contract_address,
//       token_id,
//       evaluate_basic,
//       evaluate_work,
//       evaluate_contributors,
//       evaluate_properties,
//       comments,
//       tags,
//     ]);
//
//     const requestData = {
//       recipient: ZERO_ADDRESS,
//       revocable: false,
//       expirationTime: 0n,
//       data: encodedData,
//     };
//
//     const tx = await submitAttestTransaction({
//       contractAddress,
//       account,
//       schemaUid: schema.uid,
//       requestData,
//     });
//
//     await publicClient.waitForTransactionReceipt({ hash: tx });
//
//     await testClient.mine({ blocks: 5 });
//
//     await indexAttestations({
//       batchSize: 1000n,
//     });
//
//     const { data } = await supabase.from("attestations").select("*");
//
//     expect(data?.length).toBe(1);
//   });
// });
