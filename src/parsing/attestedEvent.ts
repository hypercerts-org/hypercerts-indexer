import { Hex, isAddress } from "viem";
import { Tables } from "@/types/database.types";
import { getDeployment } from "@/utils";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";

type AttestedEvent = {
  address: string;
  args: {
    recipient: `0x${string}`;
    attester: `0x${string}`;
    uid: Hex;
    schema: Hex;
  };
  blockNumber: bigint;
  [key: string]: unknown;
};

export type ParsedAttestedEvent = Pick<
  Tables<"attestations">,
  | "attester_address"
  | "recipient_address"
  | "attestation_uid"
  | "block_timestamp"
>;

/*
 * Helper method to get the recipient, attester, attestation UID and schema ID from the event. Will return undefined when the event is
 * missing data.
 *
 * @param event - The event object.
 *
 * @returns {EASdata} - The recipient, attester, attestation UID and schema ID.
 * */
export const parseAttestedEvent = async (log: unknown) => {
  if (!log || !isAttestedEvent(log)) {
    console.error(
      `Invalid event or event args for parsing Attested event: `,
      log,
    );
    return;
  }

  const { args, address } = log;
  const { easAddress } = getDeployment();

  if (
    easAddress.toLowerCase() != address.toLowerCase() ||
    !isAddress(address)
  ) {
    console.error(
      `Invalid contract address for parsing Attested event: `,
      easAddress,
      address,
    );
    return;
  }

  const res: ParsedAttestedEvent = {
    attester_address: args.attester,
    recipient_address: args.recipient,
    attestation_uid: args.uid,
    block_timestamp: await getBlockTimestamp(log.blockNumber),
  };

  return res;
};

function isAttestedEvent(event: unknown): event is AttestedEvent {
  return (
    typeof event === "object" &&
    event !== null &&
    typeof event.args === "object" &&
    event.args !== null &&
    typeof event.args.recipient === "string" &&
    isAddress(event.args.recipient) &&
    typeof event.args.attester === "string" &&
    isAddress(event.args.attester) &&
    typeof event.args.uid === "string" &&
    typeof event.args.schema === "string" &&
    typeof event.address === "string" &&
    isAddress(event.address) &&
    typeof event.blockNumber === "bigint"
  );
}
