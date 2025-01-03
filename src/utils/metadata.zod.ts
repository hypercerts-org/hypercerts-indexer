import { HypercertMetadata, HypercertClaimdata } from "@hypercerts-org/sdk";
import { z } from "zod";

const claimData: z.ZodType<HypercertClaimdata> = z.object({
  impact_scope: z.object({
    name: z.string().optional(),
    value: z.array(z.string()),
    excludes: z.array(z.string()).optional(),
    display_value: z.string().optional(),
  }),
  work_scope: z.object({
    name: z.string().optional(),
    value: z.array(z.string()),
    excludes: z.array(z.string()).optional(),
    display_value: z.string().optional(),
  }),
  work_timeframe: z.object({
    name: z.string().optional(),
    value: z.array(z.number()),
    display_value: z.string().optional(),
  }),
  impact_timeframe: z.object({
    name: z.string().optional(),
    value: z.array(z.number()),
    display_value: z.string().optional(),
  }),
  contributors: z.object({
    name: z.string().optional(),
    value: z.array(z.string()),
    display_value: z.string().optional(),
  }),
  rights: z.object({
    name: z.string().optional(),
    value: z.array(z.string()),
    excludes: z.array(z.string()).optional(),
    display_value: z.string().optional(),
  }),
});

export const HypercertMetadataValidator: z.ZodType<HypercertMetadata> =
  z.object({
    name: z.string({ message: "Name is required" }),
    description: z.string({ message: "Description is required" }),
    external_url: z
      .string({ message: "External URL is not a string" })
      .optional(),
    image: z.string({ message: "Image is required" }),
    version: z.string({ message: "Version is not a string" }).optional(),
    ref: z.string({ message: "Ref is not a string" }).optional(),
    allowList: z.string({ message: "Allow List is not a string" }).optional(),
    properties: z
      .array(
        z
          .object({
            trait_type: z
              .string({ message: "Trait type is not a string" })
              .optional(),
            value: z.string({ message: "Value is not a string" }).optional(),
            data: z.any().optional(),
          })
          .partial()
          .and(
            z.record(
              z.string().or(z.number()).or(z.boolean()).or(z.any()).optional(),
            ),
          ),
      )
      .optional(),
    hypercert: claimData,
  });

export type Metadata = z.infer<typeof HypercertMetadataValidator>;
