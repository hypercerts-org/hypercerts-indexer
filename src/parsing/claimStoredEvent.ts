import { isAddress } from "viem";
import { Tables } from "@/types/database.types";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";

type ClaimStoredEvent = {
  address: string;
  args: {
    claimID: bigint;
    uri: string;
  };
  blockNumber: bigint;
  [key: string]: unknown;
};

/*
 * Helper method to get the claimID, contract address and URI from the event. Will return undefined when the event is
 * missing claimID or URI.
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

  const { args, address } = event;

  if (!isAddress(address)) {
    console.error(
      `Invalid contract address for parsing claimStored event: `,
      event.address,
    );
    return;
  }

  const row: Partial<Tables<"hypercerts">> = {};

  row.claim_id = args.claimID;
  row.uri = args.uri;
  row.block_timestamp = await getBlockTimestamp(event.blockNumber);

  return row;
};

function isClaimStoredEvent(event: unknown): event is ClaimStoredEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    event?.args !== null &&
    typeof event?.args === "object" &&
    typeof event.args.claimID === "bigint" &&
    typeof event.args.uri === "string" &&
    typeof event.address === "string" &&
    isAddress(event.address) &&
    typeof event.blockNumber === "bigint"
  );
}
