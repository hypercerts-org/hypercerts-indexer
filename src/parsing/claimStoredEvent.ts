import { Address, isAddress } from "viem";
import { HypercertMetadata } from "@hypercerts-org/sdk";

export type ClaimData = {
  claimID: bigint;
  contractAddress: Address;
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
  // TODO checking on types
  // @ts-expect-error args.claimID is not defined in event type
  if (!event || !event.args || !event.args.claimID || !event.args.uri) {
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
    // @ts-expect-error args.claimID is not defined in event type
    claimID: event.args.claimID,
    // @ts-expect-error address is not defined in event type
    contractAddress: event.address,
    // @ts-expect-error args.uri is not defined in event type
    uri: event.args.uri,
  } as ClaimData;
};
