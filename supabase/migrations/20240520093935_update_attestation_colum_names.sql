alter table attestations
    rename column attestation_uid to uid;

alter table attestations
    rename column attester_address to attester;

alter table attestations
    rename column recipient_address to recipient;

alter table attestations
    rename column decoded_attestation to data;

DROP INDEX idx_attestations_attestation_uid;

CREATE INDEX idx_attestations_uid
    ON attestations (uid);