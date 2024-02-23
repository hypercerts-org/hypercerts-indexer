import {
  getFromIPFS,
  validateMetaData,
  HypercertMetadata,
} from "@hypercerts-org/sdk";

// possible URIs:
// bafkreidmj7hkmwwjpnugimrvs6qjgpo2urzvsnha4oxzw6
// bafkreibg3iyiy6ohwpdzs6l2cghdluyajsclc7g5szdvmpfzgulzyncwei
// ipfs://null
// ipfs://bafybeia5rablrmdjrq7eratkohu7o3hj6zmfxdnb7ra5cvwjo26pg34wli/WB_5142_impact
// https://bafkreigy2a7kxychpq7x6rbnzxexkhrwnrvmx42at7rwgy44sscpc3uy24.ipfs.w3s.link/
// need: bafkreibg3iyiy6ohwpdzs6l2cghdluyajsclc7g5szdvmpfzgulzyncwei

const extractCID = (uri: string) => {
  const match = uri.match(/(baf[a-zA-Z0-9]{56})/);
  return match ? match[0] : null;
};

export const parseClaimStoredEvent = async (event: any) => {
  const uri = extractCID(event.args.uri);

  if (!uri) {
    console.error(
      `Could not get URI for claimID ${event.args.claimID} on contract ${event.address} from event args:`,
      event.args
    );
    return;
  }

  let metadata;
  try {
    metadata = await getFromIPFS(uri);
    if (!metadata) {
      console.error(
        `No metadata found on IPFS for URI ${uri} of claimID ${event.args.claimID} on contract ${event.address}`
      );
      return;
    }
  } catch (error) {
    console.error(
      `Failed to get metadata from IPFS for URI ${uri} of claimID ${event.args.claimID} on contract ${event.address}`,
      error
    );
    return;
  }

  const validation = validateMetaData(metadata);

  if (validation.errors && Object.keys(validation.errors).length > 0) {
    console.error(
      `Invalid metadata for URI ${uri} of claimID ${event.args.claimID} on contract ${event.address}:`,
      validation.errors
    );
    return;
  }

  return {
    claimID: event.args.claimID,
    metadata: metadata as HypercertMetadata,
    contractAddress: event.address,
    cid: uri,
  };
};
