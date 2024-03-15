import { chainId } from "@/utils/constants";
import { Deployment, deployments } from "@hypercerts-org/sdk";

/*
 * This function returns the deployment for the current chain ID.
 *
 * @returns The deployment for the current chain ID.
 * @throws Error if the chain ID is not supported.
 */

export const getDeployment = (): Partial<Deployment> & {
  startBlock: bigint;
  easAddress: string;
  schemaRegistryAddress: string;
  chainId: number;
} => {
  switch (chainId) {
    case 10:
      return {
        ...deployments["10"],
        startBlock: 76066993n,
        easAddress: "0x4200000000000000000000000000000000000021",
        schemaRegistryAddress: "0x4200000000000000000000000000000000000020",
        chainId,
      };
    case 11155111:
      return {
        ...deployments["11155111"],
        startBlock: 4421944n,
        easAddress: "0xC2679fBD37d54388Ce493F1DB75320D236e1815e",
        schemaRegistryAddress: "0x0a7E2Ff54e76B8E6659aedc9103FB21c038050D0",
        chainId,
      };
    case 84532:
      return {
        ...deployments["84532"],
        startBlock: 6771210n,
        easAddress: "0x4200000000000000000000000000000000000021",
        schemaRegistryAddress: "0x4200000000000000000000000000000000000020",
        chainId,
      };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};
