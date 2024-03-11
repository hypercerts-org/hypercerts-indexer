import { storeHypercerts } from "@/storage/storeHypercerts";
import { storeAttestations } from "@/storage/storeAttestations";
import {
  storeSupportedSchema,
  storeSupportedSchemas,
} from "@/storage/storeSupportedSchemas";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas";
import { getHypercertContracts } from "@/storage/getHypercertContracts";
import { storeHypercertContract } from "@/storage/storeHypercertContract";

export {
  getHypercertContracts,
  storeAttestations,
  storeHypercerts,
  storeSupportedSchemas,
  storeSupportedSchema,
  getSupportedSchemas,
  storeHypercertContract,
};
