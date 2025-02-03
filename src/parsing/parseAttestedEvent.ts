import { ParserMethod } from "@/indexer/LogParser.js";
import {
  DecodedAttestation,
  parseAttestationData,
} from "@/parsing/parseAttestationData.js";
import { getDeployment } from "@/utils/getDeployment.js";
import { messages } from "@/utils/validation.js";
import { getAddress, isAddress, isHex } from "viem";
import { z } from "zod";

export const AttestationSchema = z.object({
  uid: z.string(),
  schema: z.string(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
});

export const AttestedEventSchema = z.object({
  address: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
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

//https://github.com/ethereum-attestation-service/eas-sdk/blob/master/src/eas.ts#L87
// Zod validation of Attestation
export const EasAttestationSchema = z.object({
  uid: z.string().refine(isHex),
  schema: z.string().refine(isHex),
  refUID: z.string().refine(isHex),
  time: z.bigint(),
  expirationTime: z.bigint(),
  revocationTime: z.bigint(),
  recipient: z
    .string()
    .refine(isAddress, { message: messages.INVALID_ADDRESS }),
  revocable: z.boolean(),
  attester: z.string().refine(isAddress, { message: messages.INVALID_ADDRESS }),
  data: z.string().refine(isHex),
});

export type EasAttestation = z.infer<typeof EasAttestationSchema>;

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
  event,
  context: { chain_id, schema, readContract },
}) => {
  if (!schema) throw new Error("[parseAttestedEvent] Schema not found");
  if (!readContract) throw new Error("readContract is not defined");

  const { easAddress } = getDeployment(chain_id);
  const validator = createAttestedEventSchema({ easAddress });

  try {
    const { params } = validator.parse(event);

    const _attestationData = await readContract({
      address: getAddress(easAddress),
      contract: "EAS",
      functionName: "getAttestation",
      args: [params.uid],
    });

    return [
      parseAttestationData({
        attestation: EasAttestationSchema.parse(_attestationData),
        schema,
      }),
    ];
  } catch (error) {
    console.error("[parseAttestedEvent] Error parsing attested event", error);
    throw error;
  }
};
