import { chainId } from "@/utils/constants";
import { Deployment, deployments } from "@hypercerts-org/sdk";

export const getDeployment = (): Partial<Deployment> & {
  startBlock: bigint;
} => {
  switch (chainId) {
    case "10":
      return { ...deployments["10"], startBlock: 76066993n };
    case "11155111":
      return { ...deployments["11155111"], startBlock: 4421944n };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};
