import { isAddress } from "viem";
import { HypercertMetadata } from "@hypercerts-org/sdk";

type ClaimStoredEvent = {
  address: string;
  args: {
    claimID: bigint;
    uri: string;
  };
  [key: string]: unknown;
};

export type ClaimData = {
  claimID: bigint;
  contractAddress: `0x${string}`;
  uri: string;
  metadata?: HypercertMetadata;
};

/*
 * Helper method to get the claimID, contract address and URI from the event. Will return undefined when the event is
 * missing claimID or URI.
 *
 * @param event - The event object.
 * */
export const parseClaimStoredEvent = (event: unknown) => {
  if (!isClaimStoredEvent(event)) {
    console.error(
      `Invalid event or event args for parsing claimStored event: `,
      event,
    );
    return;
  }

  if (!isAddress(event.address)) {
    console.error(
      `Invalid contract address for parsing claimStored event: `,
      event.address,
    );
    return;
  }

  // TODO check on claimID uint256/bigint

  return {
    claimID: event.args.claimID,
    contractAddress: event.address,
    uri: event.args.uri,
  } as ClaimData;
};

function isClaimStoredEvent(event: unknown): event is ClaimStoredEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    typeof event.args === "object" &&
    event.args !== null &&
    typeof event.args.claimID === "bigint" &&
    typeof event.args.uri === "string" &&
    typeof event.address === "string" &&
    isAddress(event.address)
  );
}
