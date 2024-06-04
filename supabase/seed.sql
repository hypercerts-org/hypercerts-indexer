DO
$$
    DECLARE
        event_id    uuid;
        sepolia_contract_id uuid;
        optimism_contract_id uuid;
    BEGIN
        -- Insert into events table and store the inserted id in a variable
        INSERT INTO public.events (name, abi)
        VALUES ('ClaimStored', 'event ClaimStored(uint256 indexed claimID, string uri, uint256 totalUnits)')
        RETURNING id INTO event_id;

        -- Insert into contracts table and store the inserted id in a variable
        INSERT INTO public.contracts (chain_id, contract_address)
        VALUES (11155111, '0xa16DFb32Eb140a6f3F2AC68f41dAd8c7e83C4941')
        RETURNING id INTO sepolia_contract_id;

        INSERT INTO public.contracts (chain_id, contract_address)
        VALUES (10, '0x822F17A9A5EeCFd66dBAFf7946a8071C265D1d07')
        RETURNING id INTO optimism_contract_id;

        -- Insert into contract_events table
        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (sepolia_contract_id, event_id);

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (optimism_contract_id, event_id);

        -- Repeat the process for the second set of data
        INSERT INTO public.events (name, abi)
        VALUES ('TransferSingle',
                'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)')
        RETURNING id INTO event_id;

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (sepolia_contract_id, event_id);

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (optimism_contract_id, event_id);

        -- Repeat the process for the third set of data
        INSERT INTO public.events (name, abi)
        VALUES ('ValueTransfer',
                'event ValueTransfer(uint256 claimID, uint256 fromTokenID, uint256 toTokenID, uint256 value)')
        RETURNING id INTO event_id;

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (sepolia_contract_id, event_id);

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (optimism_contract_id, event_id);

        -- Repeat the process for the fourth set of data
        INSERT INTO public.events (name, abi)
        VALUES ('AllowlistCreated',
                'event AllowlistCreated(uint256 tokenID, bytes32 root)')
        RETURNING id INTO event_id;

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (sepolia_contract_id, event_id);

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (optimism_contract_id, event_id);

        -- Repeat the process for the fifth set of data
        INSERT INTO public.events (name, abi)
        VALUES ('LeafClaimed',
                'event LeafClaimed(uint256 tokenID, bytes32 leaf)')
        RETURNING id INTO event_id;

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (sepolia_contract_id, event_id);

        INSERT INTO public.contract_events (contracts_id, events_id)
        VALUES (optimism_contract_id, event_id);
    END
$$;

insert into public.supported_schemas (chain_id, eas_schema_id, last_block_indexed)
values (11155111, '0x3c0d0488e4d50455ef511f2c518403d21d35aa671ca30644aa9f7f7bb2516e2f', 5484610);
