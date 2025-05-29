import { isAddress, isHex, parseEventLogs } from "viem";
import { z } from "zod";
import { Claim, ClaimSchema } from "@/storage/storeClaimStored.js";
import { ParserMethod } from "@/indexer/LogParser.js";
import { ZERO_ADDRESS } from "@/utils/constants.js";
import { getEvmClient } from "@/clients/evmClient.js";
import { HypercertMinterAbi } from "@hypercerts-org/contracts";

export const ClaimStoredEventSchema = z.object({
  address: z.string().refine(isAddress, {
    message: "[ParseClaimStoredEvent] Invalid contract address",
  }),
  params: z.object({
    claimID: z.coerce.bigint(),
    uri: z.string(),
    totalUnits: z.coerce.bigint(),
  }),
  transactionHash: z.string().refine(isHex),
});

export type ParseClaimStoredEvent = z.infer<typeof ClaimStoredEventSchema>;

/**
 * Parses a ParseClaimStoredEvent and retrieves additional information about the transaction.
 *
 * @param event - The event to parse.
 * @param context - The context to use for parsing.
 * @returns  A promise that resolves to an object containing the parsed event data.
 * @throws If the event does not match the ClaimStoredEventSchema, a Zod validation error is thrown.
 */
export const parseClaimStoredEvent: ParserMethod<Claim> = async ({
  event,
  context: { chain_id, contracts_id },
}) => {
  const { params, transactionHash } = ClaimStoredEventSchema.parse(event);
  const client = getEvmClient(Number(chain_id));

  try {
    // get the operator from the transferSingle event, this is necessary for safe support
    // otherwise transaction.from is the address of the last signer in safe
    const receipt = await client.getTransactionReceipt({
      hash: transactionHash,
    });
    const parsedLogs = parseEventLogs({
      abi: HypercertMinterAbi,
      logs: receipt.logs,
    });
    const transferSingleEvent = parsedLogs.find(
      // @ts-expect-error eventName is missing in the type
      (log) => log.eventName === "TransferSingle",
    );
    if (!transferSingleEvent) {
      throw new Error("TransferSingle event not found");
    }
    // @ts-expect-error args is missing in the type
    const operator = transferSingleEvent.args.operator;

    return [
      ClaimSchema.parse({
        contracts_id: contracts_id,
        owner_address: ZERO_ADDRESS,
        creator_address: operator,
        token_id: params.claimID,
        uri: params.uri,
        units: params.totalUnits,
      }),
    ];
  } catch (error) {
    console.error(
      "[ParseClaimStoredEvent] Error parsing claim stored event",
      error,
    );
    throw error;
  }
};
