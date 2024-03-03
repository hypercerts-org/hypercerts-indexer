import { ClaimData } from "@/parsing/claimStoredEvent";
import axios from "axios";

export type IPFSPointer = {
  cid: string;
  path: string;
};

export const fetchFromIPFS = async (claim: ClaimData) => {
  try {
    const res = await getFromIPFSGateways(claim.uri);

    if (!res || !res.data) {
      return;
    }

    return res.data;
  } catch (error) {
    console.error(
      `Failed to get metadata from IPFS for URI ${claim.uri} of claimID ${claim.claimID} on contract ${claim.contractAddress}`,
      error,
    );
    return;
  }
};

export const fetchFromHTTPS = async (claim: ClaimData) => {
  // URL validation
  const url = new URL(claim.uri);
  try {
    const res = await axios.get(url.toString());

    if (!res || !res.data) {
      return;
    }

    return res.data;
  } catch (error) {
    console.error(
      `Failed to get metadata from URI ${claim.uri} of claimID ${claim.claimID} on contract ${claim.contractAddress}`,
      error,
    );
    return;
  }
};

const getFromIPFSGateways = async (
  cidOrIpfsUri: string,
  timeout: number = 10000,
) => {
  const pointer = getPointer(cidOrIpfsUri);

  console.debug(pointer);

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

  return res;
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

  console.debug(`URI: ${cid} CID: ${cid}, Path: ${path}`);

  return { cid, path } as IPFSPointer;
};

const getDwebLinkGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.dweb.link/${pointer.path}`;
};

const getNftStorageGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.nftstorage.link/${pointer.path}`;
};

const getWeb3UpGatewayUri = (pointer: IPFSPointer) => {
  return `https://${pointer.cid}.ipfs.w3s.link/${pointer.path}`;
};
