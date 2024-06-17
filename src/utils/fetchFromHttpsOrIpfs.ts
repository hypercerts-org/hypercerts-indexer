import { fetchFromHTTPS, fetchFromIPFS } from "@/utils/fetching.js";

export const fetchFromHttpsOrIpfs = async (uri?: string): Promise<unknown> => {
  if (!uri || uri === "ipfs://null" || uri === "ipfs://") {
    console.warn("[fetchFromHttpsOrIpfs] URI is missing");
    return;
  }

  let fetchResult;

  // Try from IPFS
  if (uri.startsWith("ipfs://")) {
    fetchResult = await fetchFromIPFS({ uri });
  }

  // Try from HTTPS
  if (uri.startsWith("https://")) {
    fetchResult = await fetchFromHTTPS({ uri });
  }

  // If nothing found yet, try from IPFS as CID
  if (!fetchResult) {
    fetchResult = await fetchFromIPFS({ uri });
  }

  return fetchResult;
};
