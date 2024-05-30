alter table "public"."hypercert_allow_list_records" add column "claimed" boolean not null default false;

alter table "public"."hypercert_allow_list_records" add column "leaf" text not null default '';

alter table "public"."hypercert_allow_list_records" add column "proof" jsonb not null default '{}'::jsonb;

CREATE OR REPLACE FUNCTION store_allow_list_records(
    _claims_id UUID,
    _allow_list_data_id UUID,
    _records JSON[]
)
    RETURNS VOID
    LANGUAGE plpgsql
AS
$$
DECLARE
_hypercert_allow_lists_id UUID;
    _record                   JSON;
BEGIN
    -- Check if an entry for claims_id and allow_list_data_id exists in hypercert_allow_lists
SELECT id
INTO _hypercert_allow_lists_id
FROM hypercert_allow_lists
WHERE claims_id = _claims_id
  AND allow_list_data_id = _allow_list_data_id;

-- If not, create one
IF _hypercert_allow_lists_id IS NULL THEN
        INSERT INTO hypercert_allow_lists (claims_id, allow_list_data_id, parsed)
        VALUES (_claims_id, _allow_list_data_id, false)
        RETURNING id INTO _hypercert_allow_lists_id;
END IF;

    -- Loop over the array to store each record
FOR _record IN SELECT * FROM unnest(_records)
                                 LOOP
    INSERT INTO hypercert_allow_list_records (hypercert_allow_lists_id, user_address, units, entry, leaf, proof)
               VALUES (_hypercert_allow_lists_id, lower(_record ->> 'user_address')::text, (_record ->> 'units')::numeric,
                   (_record ->> 'entry')::numeric, (_record ->> 'leaf')::text, (_record ->> 'proof')::jsonb);
END LOOP;

    -- Set hypercert_allow_lists.parsed to true
UPDATE hypercert_allow_lists
SET parsed = true
WHERE id = _hypercert_allow_lists_id;
END;
$$