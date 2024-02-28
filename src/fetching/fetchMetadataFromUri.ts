import { HypercertMetadata, validateMetaData } from "@hypercerts-org/sdk";
import { ClaimData } from "@/parsing/claimStoredEvent";
import axios from "axios";

type IPFSPointer = {
  cid: string;
  path: string;
};

/*
 * This function fetches the metadata of a claim from the uri as stored in the claim on the contract.
 *
 * Because the uri can be an IPFS URI, an HTTPS URI, or a CID, this function tries to fetch the metadata from the
 * different sources in that order. If the metadata is found, it is validated and returned.
 *
 * @param claim - The claim data.
 * @returns The metadata of the claim.
 *
 * @example
 * ```js
 *
 * const claim: ClaimData = {
 *  contractAddress: "0x1234...5678",
 *  claimID: 1n,
 *  uri: "ipfs://QmXZj9Pm4g7Hv3Z6K4Vw2vW"
 *  };
 *
 * const metadata = await fetchMetadataFromUri(claim);
 * ```
 */
export const fetchMetadataFromUri = async (claim: ClaimData) => {
  const { uri, claimID, contractAddress } = claim;

  if (!uri) {
    console.error(
      `Could not get URI for claimID ${claimID} on contract ${contractAddress} `,
    );
    return claim;
  }

  let metadata;

  // Try from IPFS
  if (uri.startsWith("ipfs://")) {
    metadata = await fetchFromIPFS(claim);
  }

  // Try from HTTPS
  if (uri.startsWith("https://")) {
    metadata = await fetchFromHTTPS(claim);
  }

  // If nothing found yet, try from IPFS as CID
  if (!metadata) {
    metadata = await fetchFromIPFS(claim);
  }

  if (!metadata) {
    console.error(
      `No metadata found on IPFS for URI ${uri} of claimID ${claimID} on contract ${contractAddress}`,
    );
    return claim;
  }

  const validation = validateMetaData(metadata);

  if (!validation.valid) {
    console.error(
      `Invalid metadata for URI ${uri} of claimID ${claimID} on contract ${contractAddress}:`,
      validation.errors,
    );
    return claim;
  }

  return { ...claim, metadata: metadata as HypercertMetadata };
};

const fetchFromIPFS = async (claim: ClaimData) => {
  let metadata;
  try {
    metadata = await getFromIPFSGateways(claim.uri);
  } catch (error) {
    console.error(
      `Failed to get metadata from IPFS for URI ${claim.uri} of claimID ${claim.claimID} on contract ${claim.contractAddress}`,
      error,
    );
    return;
  }

  return metadata;
};

const fetchFromHTTPS = async (claim: ClaimData) => {
  let metadata;
  try {
    metadata = await axios.get(claim.uri);
  } catch (error) {
    console.error(
      `Failed to get metadata from URI ${claim.uri} of claimID ${claim.claimID} on contract ${claim.contractAddress}`,
      error,
    );
    return;
  }

  return metadata;
};

const getFromIPFSGateways = async (
  cidOrIpfsUri: string,
  timeout: number = 10000,
) => {
  const pointer = getPointer(cidOrIpfsUri);

  if (!pointer) {
    return;
  }

  const res = await Promise.any([
    axios.get(getDwebLinkGatewayUri(pointer), { timeout }),
    axios.get(getNftStorageGatewayUri(pointer), { timeout }),
    axios.get(getWeb3UpGatewayUri(pointer), { timeout }),
  ]).catch((err) => {
    console.error(`Failed to get ${cidOrIpfsUri} from any gateway`, err);
  });

  if (!res || !res.data) return;

  return res.data;
};
const getPointer = (uri: string) => {
  // Remove "ipfs://" and split CID from path
  const split = uri.replace("ipfs://", "").split("/");
  const cid = split.shift();

  if (!cid) {
    console.error(`No CID found in URI ${uri}`);
    return;
  }

  const path = split.join("/");

  return { cid, path } as IPFSPointer;
};

const getDwebLinkGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.dweb.link/${pointer.path}`;
};

const getNftStorageGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.nftstorage.link/${pointer.path}`;
};

const getWeb3UpGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.w3s.linke/${pointer.path}`;
};
