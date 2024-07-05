import { isAddress } from "viem";
import { getDeployment } from "@/utils/getDeployment.js";
import { z } from "zod";
import { messages } from "@/utils/validation.js";
import { ParserMethod } from "@/indexer/LogParser.js";
import { fetchAttestationData } from "@/fetching/fetchAttestationData.js";
import {
  decodeAttestationData,
  DecodedAttestation,
} from "@/parsing/attestationData.js";

export const AttestationSchema = z.object({
  uid: z.string(),
  schema: z.string(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
});

export const AttestedEventSchema = z.object({
  address: z.string().refine(isAddress),
  params: AttestationSchema,
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
 *     schema: "0x1234",
 *   },
 *   blockNumber: 1234n,
 * };
 * const parsedEvent = parseAttestedEvent(log);
 * console.log(parsedEvent); // { recipient: "0x5678", attester: "0x9abc", uid: "abcdef", block_timestamp: 1234567890n }
 * ```
 */
export const parseAttestedEvent: ParserMethod<DecodedAttestation> = async ({
  log,
  context: { schema },
}) => {
  if (!schema) throw new Error("[parseAttestedEvent] Schema not found");

  const { easAddress } = getDeployment();
  const validator = createAttestedEventSchema({ easAddress });

  try {
    const { params } = validator.parse(log);

    const attestedEvent = ParsedAttestedEventSchema.parse({
      recipient: params.recipient,
      attester: params.attester,
      uid: params.uid,
    });

    const { attestation } = await fetchAttestationData({
      attestedEvent,
    });

    return [
      decodeAttestationData({
        attestation,
        schema,
      }),
    ];
  } catch (error) {
    console.error("[parseAttestedEvent] Error parsing attested event", error);
    throw error;
  }
};
