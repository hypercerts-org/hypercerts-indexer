import { chainId } from "@/utils/constants.js";
import { Deployment, deployments } from "@hypercerts-org/sdk";

/**
 * Returns the deployment for the current chain ID.
 *
 * @returns An object containing the deployment details for the current chain ID. The object includes the start block number, the EAS address, the schema registry address, and the chain ID.
 * @throws {Error} If the chain ID is not supported, it throws an error.
 *
 * @example
 * ```typescript
 * const deployment = getDeployment();
 * console.log(deployment.startBlock); // Outputs the start block number
 * console.log(deployment.easAddress); // Outputs the EAS address
 * console.log(deployment.schemaRegistryAddress); // Outputs the schema registry address
 * console.log(deployment.chainId); // Outputs the chain ID
 */

export const getDeployment = (): Partial<Deployment> & {
  startBlock: bigint;
  easAddress: string;
  schemaRegistryAddress: string;
  chainId: number;
} => {
  switch (chainId) {
    // PRD
    case 10:
      return {
        ...deployments["10"],
        startBlock: 76066993n,
        easAddress: "0x4200000000000000000000000000000000000021",
        schemaRegistryAddress: "0x4200000000000000000000000000000000000020",
        chainId,
      };
    case 8453:
      return {
        ...deployments["8453"],
        startBlock: 76066993n,
        easAddress: "0x4200000000000000000000000000000000000021",
        schemaRegistryAddress: "0x4200000000000000000000000000000000000020",
        chainId,
      };
    case 42220:
      return {
        ...deployments["42220"],
        startBlock: 22079540n,
        easAddress: "",
        schemaRegistryAddress: "",
        chainId,
      };
    // Testnets
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
