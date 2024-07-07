import { fetchFromHTTPS, fetchFromIPFS } from "@/utils/fetching.js";

const DO_NOT_PARSE = ["ipfs://null", "ipfs://", "ipfs://example"];

export const fetchFromHttpsOrIpfs = async (uri?: string): Promise<unknown> => {
  if (!uri || DO_NOT_PARSE.includes(uri)) {
    console.warn(
      "[fetchFromHttpsOrIpfs] URI is missing or not accepted: ",
      uri,
    );
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
