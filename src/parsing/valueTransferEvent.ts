import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";
import { NewUnitTransfer } from "@/types/types";

type ValueTransferEvent = {
  address: string;
  args: {
    claimID: bigint;
    fromTokenID: bigint;
    toTokenID: bigint;
    value: bigint;
  };
  blockNumber: bigint;
  [key: string]: unknown;
};

/*
 * Helper method to get the sender, recipient, tokenID and value from the event. Will return undefined when the event is
 * missing any of the required fields.
 *
 * @param event - The event object.
 * */
export const parseValueTransfer = async (event: unknown) => {
  if (!isValueTransferEvent(event)) {
    console.error(
      `[ParseValueTransfer] Invalid event or event args for parsing TransferSingle event: `,
      event,
    );
    return;
  }

  const { args } = event;

  const row: Partial<NewUnitTransfer> = {
    from_token_id: args.fromTokenID,
    to_token_id: args.toTokenID,
    block_timestamp: await getBlockTimestamp(event.blockNumber),
    units: args.value,
  };

  return row;
};

function isValueTransferEvent(event: unknown): event is ValueTransferEvent {
  const e = event as Partial<ValueTransferEvent>;

  return (
    typeof e === "object" &&
    e !== null &&
    e?.args !== null &&
    typeof e?.args === "object" &&
    e?.args.claimID !== null &&
    typeof e?.args?.claimID === "bigint" &&
    e?.args.fromTokenID !== null &&
    typeof e?.args.fromTokenID === "bigint" &&
    e?.args.toTokenID !== null &&
    typeof e?.args.toTokenID === "bigint" &&
    e?.args.value !== null &&
    typeof e?.args.value === "bigint" &&
    typeof e.address === "string" &&
    isAddress(e.address) &&
    typeof e.blockNumber === "bigint"
  );
}
