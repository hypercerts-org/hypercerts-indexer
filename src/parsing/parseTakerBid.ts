import { isAddress } from "viem";
import { z } from "zod";
import { messages } from "@/utils/validation.js";

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

const TakerBidEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  args: z.object({
    nonceInvalidationParameters: z.object({
      orderHash: z.string(),
      orderNonce: z.bigint(),
      isNonceInvalidated: z.boolean(),
    }),
    bidUser: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    bidRecipient: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    strategyId: z.bigint(),
    currency: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    collection: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    itemIds: z.array(z.bigint()),
    amounts: z.array(z.bigint()),
    feeRecipients: z.array(
      z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
    ),
    feeAmounts: z.array(z.bigint()),
  }),
  blockNumber: z.bigint(),
});

export type TakerBidEvent = z.infer<typeof TakerBidEventSchema>;

export const parseTakerBidEvent = async (event: unknown) => {
  try {
    console.log(event);
    return TakerBidEventSchema.parse(event);
  } catch (e) {
    console.error("[parseTakerBidEvent] Error parsing event", e);
    return;
  }
};
