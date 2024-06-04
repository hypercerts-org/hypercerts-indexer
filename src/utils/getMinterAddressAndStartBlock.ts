import { getDeployment } from "@/utils/getDeployment";
import { isAddress } from "viem";

/**
 * Retrieves the address and start block of the HypercertMinterUUPS from the deployment.
 *
 * This function calls the `getDeployment` function to get the deployment details, which includes the addresses and start block.
 * It then checks if the HypercertMinterUUPS address is available in the addresses. If it's not available, it throws an error.
 * If the HypercertMinterUUPS address is available, it returns an object containing the address and the start block.
 *
 * @returns {object} An object containing the address of the HypercertMinterUUPS and the start block.
 * @property {string} address - The address of the HypercertMinterUUPS.
 * @property {number} startBlock - The start block of the deployment.
 *
 * @throws {Error} If the HypercertMinterUUPS address is not available in the addresses or invalid, it throws an error with the message "[getMinterAddressAndStartBlock] HypercertMinterUUPS is not available".
 *
 * @example
 * ```typescript
 * const { address, startBlock } = getMinterAddressAndStartBlock();
 * console.log(address, startBlock);
 * ```
 * */
export const getMinterAddressAndStartBlock = () => {
  const { addresses, startBlock } = getDeployment();

  if (
    !addresses?.HypercertMinterUUPS ||
    !isAddress(addresses.HypercertMinterUUPS)
  ) {
    throw Error(
      "[getMinterAddressAndStartBlock] HypercertMinterUUPS is not available",
    );
  }

  return { address: addresses.HypercertMinterUUPS, startBlock };
};
