import { Hex, isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";
import { NewClaim } from "@/types/types";
import { client } from "@/clients/evmClient";

type ClaimStoredEvent = {
  address: string;
  args: {
    claimID: bigint;
    uri: string;
    totalUnits: bigint;
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
export const parseClaimStoredEvent = async (event: unknown) => {
  if (!isClaimStoredEvent(event)) {
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

  const claim: NewClaim = {
    creator_address: transaction.from,
    token_id: args.claimID,
    uri: args.uri,
    block_timestamp: await getBlockTimestamp(event.blockNumber),
    units: args.totalUnits,
    contract_address: addres,
  };

  return claim;
};

function isClaimStoredEvent(event: unknown): event is ClaimStoredEvent {
  const e = event as Partial<ClaimStoredEvent>;

  return (
    typeof e === "object" &&
    e !== null &&
    e?.args !== null &&
    typeof e?.args === "object" &&
    e?.args?.claimID !== null &&
    e?.args?.uri !== null &&
    e?.args?.totalUnits !== null &&
    typeof e.address === "string" &&
    isAddress(e.address) &&
    typeof e.blockNumber === "bigint" &&
    e.transactionHash !== null
  );
}
