import EasAbi from "@/abis/eas.js";
import HypercertExchangeAbi from "@/abis/hypercertExchange.js";
import HypercertMinterAbi from "@/abis/hypercertMinter.js";
import SchemaRegistryAbi from "@/abis/schemaRegistry.js";
import { EvmClientFactory } from "@/clients/evmClient.js";
import { UnifiedRpcClientFactory } from "@/clients/rpcClientFactory.js";
import { processEvent } from "@/indexer/eventHandlers.js";
import RequestQueue from "@/indexer/requestQueue.js";
import { getContractEventsForChain } from "@/storage/getContractEventsForChain.js";
import { getSupportedSchemas } from "@/storage/getSupportedSchemas.js";
import {
  Environment,
  environment,
  localCachingDbUrl,
} from "@/utils/constants.js";
import { createIndexer, createPostgresCache } from "@hypercerts-org/chainsauce";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: localCachingDbUrl,
  max: 20,

  idleTimeoutMillis: 30_000,
  keepAlive: true,
});

// -- Define contracts
const MyContracts = {
  HypercertMinter: HypercertMinterAbi,
  SchemaRegistry: SchemaRegistryAbi,
  HypercertExchange: HypercertExchangeAbi,
  EAS: EasAbi,
};

export const getIndexer = async ({
  chainId,
  requestQueue,
}: {
  chainId: number;
  requestQueue: RequestQueue;
}) => {
  // -- Create an indexer:
  const supportedSchemas = await getSupportedSchemas({ chainId });
  const contractEvents = await getContractEventsForChain({ chainId });

  // Use EvmClientFactory to get the URL - it handles provider fallbacks
  const rpcUrl = EvmClientFactory.getFirstAvailableUrl(chainId);
  if (!rpcUrl) throw new Error(`No RPC URL available for chain ${chainId}`);

  const cache = createPostgresCache({
    connectionPool: pool,
    schemaName: `cache_${chainId}`,
  });

  const httpRpcClient = UnifiedRpcClientFactory.createChainsauceClient(
    chainId,
    rpcUrl,
  );

  const indexer = createIndexer({
    cache,
    chain: {
      id: chainId,
      maxBlockRange: 60480n,
      rpcClient: httpRpcClient,
      pollingIntervalMs: environment === Environment.TEST ? 10_000 : 5_000,
    },
    contracts: MyContracts,
    context: {
      chain_id: chainId,
      supportedSchemas,
    },
  });

  const getContractEvent = async (eventName: string) => {
    const contractEvent = contractEvents?.find(
      (ce) => ce.event_name === eventName,
    );

    if (!contractEvent) {
      console.warn(`Contract event not found for ${eventName}`);
      return;
    }

    return contractEvent;
  };

  indexer.on(
    "HypercertMinter:ClaimStored",
    async ({ event, getBlock, getData, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:URI",
    async ({ event, getBlock, getData, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:ValueTransfer",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:BatchValueTransfer",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:TransferSingle",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:TransferBatch",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertMinter:LeafClaimed",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "HypercertExchange:TakerBid",
    async ({ event, getData, getBlock, readContract }) => {
      const contractEvent = await getContractEvent(event.name);
      if (!contractEvent) return;

      const { contracts_id, events_id } = contractEvent;
      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block: await getBlock(),
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
      });
    },
  );

  indexer.on(
    "EAS:Attested",
    async ({
      event,
      getData,
      getBlock,
      context: { supportedSchemas },
      readContract,
    }) => {
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

      const context = {
        event_name: event.name,
        chain_id: chainId,
        contracts_id,
        events_id,
        block,
        schema,
        getData,
        readContract,
      };

      const requests = await processEvent({
        event,
        context,
      });

      if (!requests || requests?.length === 0) return;

      requestQueue.addRequests({
        requests,
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
        fromBlock:
          event.last_block_indexed > event.start_block
            ? event.last_block_indexed
            : event.start_block,
        toBlock: "latest",
      });
    }
  }

  indexer.on("error", (error) => {
    console.error("[chainsauce]: error while indexing", error);
  });

  indexer.on("progress", async (progress) => {
    const percentage = (progress.currentBlock * 100n) / progress.targetBlock;
    console.info(
      `${chainId} | ${progress.currentBlock}/${progress.targetBlock} | ${percentage}% | ${progress.pendingEventsCount} pending events`,
    );
  });

  return indexer.watch();
};
