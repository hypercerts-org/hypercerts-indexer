import { createIndexer, createHttpRpcClient } from "chainsauce";
import { getRpcUrl } from "@/clients/evmClient.js";
import SchemaRegistryAbi from "@/abis/schemaRegistry.js";
import HypercertMinterAbi from "@/abis/hypercertMinter.js";
import HypercertExchangeAbi from "@/abis/hypercertExchange.js";
import { processEvent } from "@/indexer/eventHandlers.js";
import { chainId as chain_id } from "@/utils/constants.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import EasAbi from "@/abis/eas.js";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas.js";
import { assertExists } from "@/utils/assertExists.js";

// -- Define contracts
const MyContracts = {
  HypercertMinter: HypercertMinterAbi,
  SchemaRegistry: SchemaRegistryAbi,
  HypercertExchange: HypercertExchangeAbi,
  EAS: EasAbi,
};

// -- Create an indexer:
const supportedSchemas = await getSupportedSchemas();
const contractEvents = await getContractEventsForChain();

const rpcUrl = assertExists(getRpcUrl(), "rpcUrl");

const indexer = createIndexer({
  chain: {
    id: chain_id,
    maxBlockRange: 100000n,
    rpcClient: createHttpRpcClient({ url: rpcUrl }),
  },
  contracts: MyContracts,
  context: {
    chain_id,
    supportedSchemas,
  },
});

const getContractEvent = async (eventName: string) => {
  const contractEvent = contractEvents?.find(
    (ce) => ce.event_name === eventName,
  );

  if (!contractEvent) {
    console.log(contractEvents);
    console.warn(`Contract event not found for ${eventName}`);
    return;
  }

  return contractEvent;
};

indexer.on("HypercertMinter:ClaimStored", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on("HypercertMinter:ValueTransfer", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on(
  "HypercertMinter:BatchValueTransfer",
  async ({ event, getBlock }) => {
    const contractEvent = await getContractEvent(event.name);

    if (!contractEvent) return;

    const block = await getBlock();
    const { contracts_id, events_id } = contractEvent;

    await processEvent({
      log: event,
      context: {
        event_name: event.name,
        chain_id,
        contracts_id,
        events_id,
        block,
      },
    });
  },
);

indexer.on("HypercertMinter:TransferBatch", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on("HypercertMinter:TransferSingle", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on("HypercertMinter:LeafClaimed", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on("HypercertExchange:TakerBid", async ({ event, getBlock }) => {
  const contractEvent = await getContractEvent(event.name);

  if (!contractEvent) return;

  const block = await getBlock();
  const { contracts_id, events_id } = contractEvent;

  await processEvent({
    log: event,
    context: {
      event_name: event.name,
      chain_id,
      contracts_id,
      events_id,
      block,
    },
  });
});

indexer.on(
  "EAS:Attested",
  async ({ event, getBlock, context: { supportedSchemas } }) => {
    const contractEvent = await getContractEvent(event.name);

    if (!contractEvent || !supportedSchemas) {
      return;
    }

    const { params } = event;
    const schema = supportedSchemas.find(
      (schema) => schema.uid === params.schema,
    );

    if (!schema) {
      return;
    }

    const block = await getBlock();
    const { contracts_id, events_id } = contractEvent;

    await processEvent({
      log: event,
      context: {
        event_name: event.name,
        chain_id,
        contracts_id,
        events_id,
        block,
      },
    });
  },
);

// -- Subscribe to deployed contracts based on contract events
const slugToContractName = (slug: string) => {
  switch (slug) {
    case "minter-contract":
      return "HypercertMinter";
    case "marketplace-contract":
      return "HypercertExchange";
    case "eas-contract":
      return "EAS";
    default:
      return;
  }
};

if (contractEvents) {
  for (const event of contractEvents) {
    console.log(event);
    const contract = slugToContractName(event.contract_slug);

    if (!contract) {
      console.warn(`Contract not found for ${event.contract_slug}`);
      continue;
    }

    indexer.subscribeToContract({
      contract,
      address: event.contract_address,
      fromBlock: event.start_block,
      toBlock: "latest",
    });
  }
}

indexer.on("error", (error) => {
  console.error("[chainsauce]: error while indexing", error);
});

indexer.on("progress", (progress) => {
  //     pendingEventsCount: 23
  const percentage = (progress.currentBlock * 100n) / progress.targetBlock;
  console.info(
    `Indexed ${progress.currentBlock}/${progress.targetBlock} blocks | ${percentage}% | ${progress.pendingEventsCount} pending events`,
  );
});

export default indexer;
