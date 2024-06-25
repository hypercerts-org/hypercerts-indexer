import { HypercertMetadata, HypercertClaimdata } from "@hypercerts-org/sdk";
import { z } from "zod";

const claimData: z.ZodType<HypercertClaimdata> = z.object({
  impact_scope: z.object({
    name: z.string(),
    value: z.array(z.string()),
    excludes: z.array(z.string()),
    display_value: z.string(),
  }),
  work_scope: z.object({
    name: z.string(),
    value: z.array(z.string()),
    excludes: z.array(z.string()),
    display_value: z.string(),
  }),
  work_timeframe: z.object({
    name: z.string(),
    value: z.array(z.number()),
    display_value: z.string(),
  }),
  impact_timeframe: z.object({
    name: z.string(),
    value: z.array(z.number()),
    display_value: z.string(),
  }),
  contributors: z.object({
    name: z.string(),
    value: z.array(z.string()),
    display_value: z.string(),
  }),
  rights: z.object({
    name: z.string(),
    value: z.array(z.string()),
    excludes: z.array(z.string()),
    display_value: z.string(),
  }),
});

const HypercertMetadataValidator: z.ZodType<HypercertMetadata> = z.object({
  name: z.string(),
  description: z.string(),
  external_url: z.string().optional(),
  image: z.string(),
  version: z.string().optional(),
  ref: z.string().optional(),
  allowList: z.string().optional(),
  properties: z
    .array(
      z.object({
        trait_type: z.string().optional(),
        value: z.string().optional(),
      }),
    )
    .optional(),
  hypercert: claimData,
});

export { HypercertMetadataValidator };
