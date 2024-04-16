import { isAddress } from "viem";
import { NewAllowList } from "@/types/types";

type AllowListCreatedEvent = {
  address: string;
  args: {
    tokenID: bigint;
    root: string;
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
export const parseAllowListCreated = async (event: unknown) => {
  if (!isAllowListCreatedEvent(event)) {
    console.error(
      `[ParseAllow:istCreated] Invalid event or event args for parsing AllowlistCreated event: `,
      event,
    );
    return;
  }

  const { args } = event;

  const row: Partial<NewAllowList> = {
    token_id: args.tokenID,
    root: args.root,
  };

  return row;
};

function isAllowListCreatedEvent(
  event: unknown,
): event is AllowListCreatedEvent {
  const e = event as Partial<AllowListCreatedEvent>;

  return (
    typeof e === "object" &&
    e !== null &&
    e?.args !== null &&
    typeof e?.args === "object" &&
    e?.args.tokenID !== null &&
    typeof e?.args?.tokenID === "bigint" &&
    e?.args.root !== null &&
    typeof e?.args?.root === "string" &&
    typeof e.address === "string" &&
    isAddress(e.address) &&
    typeof e.blockNumber === "bigint"
  );
}
