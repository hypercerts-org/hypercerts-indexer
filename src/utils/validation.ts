import { isAddress } from "viem";
import { z } from "zod";

export const isEthAddress = z
  .string()
  .refine((value) => isAddress(value, { strict: false }), {
    message:
      "Provided address is invalid. Please insure you have typed correctly.",
  });

export const messages = {
  INVALID_ADDRESS:
    "Provided address is invalid. Please insure you have typed correctly.",
};
