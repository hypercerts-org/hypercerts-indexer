import { isAddress } from "viem";
import { Tables } from "@/types/database.types";
import { getDeployment } from "@/utils";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";

type AttestedEvent = {
  address: string;
  args: {
    recipient: `0x${string}`;
    attester: `0x${string}`;
    uid: string;
    schema: string;
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
  const e = event as Partial<AttestedEvent>;

  return (
    typeof e === "object" &&
    e !== null &&
    typeof e.args === "object" &&
    e.args !== null &&
    isAddress(e.args.recipient) &&
    isAddress(e.args.attester) &&
    typeof e.args.uid === "string" &&
    typeof e.args.schema === "string" &&
    typeof e.address === "string" &&
    isAddress(e.address) &&
    typeof e.blockNumber === "bigint"
  );
}
