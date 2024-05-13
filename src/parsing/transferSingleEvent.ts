import { isAddress } from "viem";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp";
import { NewTransfer } from "@/types/types";
import { isClaimToken } from "@/utils/tokenIds";

type TransferSingleEvent = {
  address: string;
  args: {
    operator: string;
    from: string;
    to: string;
    id: bigint;
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
export const parseTransferSingle = async (event: unknown) => {
  if (!isTransferSingleEvent(event)) {
    console.error(
      `Invalid event or event args for parsing TransferSingle event: `,
      event,
    );
    return;
  }

  const { args } = event;

  const row: Partial<NewTransfer> = {
    token_id: args.id,
    block_timestamp: await getBlockTimestamp(event.blockNumber),
    block_number: event.blockNumber,
    value: args.value,
    owner_address: args.to,
  };

  return row;
};

function isTransferSingleEvent(event: unknown): event is TransferSingleEvent {
  const e = event as Partial<TransferSingleEvent>;

  return (
    typeof e === "object" &&
    e !== null &&
    e?.args !== null &&
    typeof e?.args === "object" &&
    typeof e?.args.operator === "string" &&
    isAddress(e?.args.operator) &&
    typeof e?.args.from === "string" &&
    isAddress(e?.args.from) &&
    typeof e?.args.to === "string" &&
    isAddress(e?.args.to) &&
    typeof e?.args.id === "bigint" &&
    typeof e?.args.value === "bigint" &&
    typeof e.address === "string" &&
    isAddress(e.address) &&
    typeof e.blockNumber === "bigint"
  );
}
