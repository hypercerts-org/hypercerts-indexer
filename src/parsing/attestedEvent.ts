import { isAddress } from "viem";
import { getDeployment } from "@/utils/getDeployment.js";
import { getBlockTimestamp } from "@/utils/getBlockTimestamp.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";

export const AttestationSchema = z.object({
  uid: z.string(),
  schema: z.string(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
});

export type Attestation = z.infer<typeof AttestationSchema>;

export const AttestedEventSchema = z.object({
  address: z.string().refine(isAddress),
  args: z.object({
    recipient: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    attester: z
      .string()
      .refine(isAddress, { message: messages.INVALID_ADDRESS }),
    uid: z.string(),
    schema: z.string(),
  }),
  blockNumber: z.bigint(),
});

const createAttestedEventSchema = ({ easAddress }: { easAddress: string }) => {
  return AttestedEventSchema.extend({
    address: z
      .string()
      .refine((address) => address.toLowerCase() == easAddress.toLowerCase(), {
        message: "[parseAttestedEvent] Address does not match EAS address",
      }),
  });
};

const ParsedAttestedEventSchema = z.object({
  recipient: z.string(),
  attester: z.string(),
  uid: z.string(),
  creation_block_number: z.bigint(),
  creation_block_timestamp: z.bigint(),
  last_block_update_number: z.bigint(),
  last_block_update_timestamp: z.bigint(),
});

export type ParsedAttestedEvent = z.infer<typeof ParsedAttestedEventSchema>;

/**
 * Parses an attested event to extract the recipient, attester, attestation UID and block timestamp.
 *
 * This function attempts to parse the event object after validation.
 * If the event object is valid, it extracts the recipient, attester, attestation UID and block timestamp from the event's args property,
 * and returns them in a new object. If the event object is not valid or the contract address is invalid, it logs an error and returns undefined.
 *
 * @param log - The event object to parse. Its structure should match the schema created with the `createAttestedEventSchema` function.
 *
 * @returns An object containing the recipient, attester, attestation UID and block timestamp from the event's args property, or undefined if the event object is not valid or the contract address is invalid.
 *
 * @example
 * ```typescript
 * const log = {
 *   address: "0x1234",
 *   args: {
 *     recipient: "0x5678",
 *     attester: "0x9abc",
 *     uid: "abcdef",
 *   },
 *   blockNumber: 1234n,
 * };
 * const parsedEvent = parseAttestedEvent(log);
 * console.log(parsedEvent); // { recipient: "0x5678", attester: "0x9abc", uid: "abcdef", block_timestamp: 1234567890n }
 * ```
 */
export const parseAttestedEvent = async (log: unknown) => {
  const { easAddress } = getDeployment();
  const validator = createAttestedEventSchema({ easAddress });
  const { args, blockNumber } = validator.parse(log);

  return ParsedAttestedEventSchema.parse({
    recipient: args.recipient,
    attester: args.attester,
    uid: args.uid,
    creation_block_number: blockNumber,
    creation_block_timestamp: await getBlockTimestamp(blockNumber),
    last_block_update_number: blockNumber,
    last_block_update_timestamp: await getBlockTimestamp(blockNumber),
  });
};
