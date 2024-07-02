import { isAddress } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/processLogs.js";

/**
 * Parses an event object to extract the tokenID and root.
 *
 * This function attempts to parse the event object using the AllowListCreatedEventSchema.
 * If the event object is valid, it extracts the tokenID and root from the event's args property,
 * and returns them in a new object. If the event object is not valid, it logs an error and returns undefined.
 *
 * @param event - The event object to parse. Its structure should match the AllowListCreatedEventSchema.
 *
 * @returns An object containing the tokenID and root from the event's args property, or undefined if the event object is not valid.
 *
 * @example
 * ```typescript
 * const event = {
 *   address: "0x1234",
 *   args: {
 *     tokenID: 5678n,
 *     root: "0x5678",
 *   },
 *   blockNumber: 1234n,
 * };
 * const parsedEvent = parseAllowListCreated(event);
 * console.log(parsedEvent); // { token_id: 5678n, root: "0x5678" }
 * */

const AllowListCreatedEvent = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  args: z.object({
    tokenID: z.bigint(),
    root: z.string(),
  }),
  blockNumber: z.bigint(),
});

export type AllowListCreatedEvent = z.infer<typeof AllowListCreatedEvent>;

export const parseAllowListCreated: ParserMethod<any> = async (
  event: unknown,
) => {
  try {
    const { args } = AllowListCreatedEvent.parse(event);

    return {
      token_id: args.tokenID,
      root: args.root,
    };
  } catch (e) {
    console.error("[parseAllowListCreated] Error parsing event", e);
    return;
  }
};
