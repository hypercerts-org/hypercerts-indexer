import { Hex, isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";
import { LeafClaimed, NewClaim } from "@/types/types";
import { client } from "@/clients/evmClient";
import { z } from "zod";

type ClaimStoredEvent = {
  address: string;
  args: {
    tokenID: bigint;
    leaf: string;
  };
  blockNumber: bigint;
  transactionHash: Hex;
  [key: string]: unknown;
};

/*
 * Helper method to get the claimID, contract address, URI, and units from the event. Will return undefined when the event is
 * missing values.
 *
 * @param event - The event object.
 * */
export const parseLeafClaimedEvent = async (event: unknown) => {
  if (!isLeafClaimedEvent(event)) {
    console.error(
      `Invalid event or event args for parsing claimStored event: `,
      event,
    );
    return;
  }

  const { args, address, transactionHash } = event;

  const transaction = await client.getTransaction({
    hash: transactionHash,
  });

  const claim: Partial<LeafClaimed> = {
    creator_address: transaction.from,
    token_id: args.tokenID,
    block_timestamp: await getBlockTimestamp(event.blockNumber),
    contract_address: address,
    leaf: args.leaf,
  };

  return claim;
};

function isLeafClaimedEvent(event: unknown): event is ClaimStoredEvent {
  const e = event as Partial<ClaimStoredEvent>;

  try {
    z.object({
      args: z.object({
        tokenID: z.bigint(),
        leaf: z.string(),
      }),
      address: z.string().refine(isAddress),
      blockNumber: z.bigint(),
      transactionHash: z.string(),
    }).parse(e);
    return true;
  } catch (error) {
    console.error("[isLeafClaimedEvent]", error);
    return false;
  }
}
