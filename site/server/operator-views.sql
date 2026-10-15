-- Run with the migration role in the chosen application schema.
-- These views contain personal data and belong only in a restricted SQL client.
CREATE OR REPLACE VIEW enquiry_operator_inbox AS
SELECT r.receipt, r.created_at,
  e.payload->>'name' AS name, e.payload->>'email' AS email,
  e.payload->>'when' AS event_timing, e.payload->>'where' AS event_place,
  e.payload->>'message' AS message, e.payload->>'story' AS story,
  o.status AS notification_status, o.provider_id, o.last_reason,
  o.attempt_count, o.next_attempt_at, o.updated_at
FROM enquiry_receipts r JOIN enquiries e USING (receipt)
JOIN notification_outbox o USING (receipt);

CREATE OR REPLACE VIEW enquiry_operator_recovery AS
SELECT r.receipt, r.created_at, r.pii_deleted_at, o.status AS notification_status,
  o.provider_id, o.last_reason, o.attempt_count, o.next_attempt_at, o.updated_at
FROM enquiry_receipts r JOIN notification_outbox o USING (receipt)
WHERE o.status IN ('pending', 'sending', 'delivery_delayed', 'failed', 'bounced', 'complained', 'needs_reconciliation');

-- Provisioning template only. Replace sevensteps with the actual app schema;
-- create the named roles with least privilege through the authorized account.
-- The migration owner retains DDL; runtime cannot read operator views or purge.
-- REVOKE ALL ON SCHEMA sevensteps FROM PUBLIC;
-- GRANT USAGE ON SCHEMA sevensteps TO sevensteps_runtime, sevensteps_operator;
-- GRANT SELECT, INSERT ON sevensteps.enquiry_receipts, sevensteps.enquiries TO sevensteps_runtime;
-- GRANT SELECT, INSERT ON sevensteps.notification_outbox TO sevensteps_runtime;
-- GRANT UPDATE (provider_id, status, next_attempt_at, first_attempt_at, attempt_count,
--   lease_owner, lease_until, last_reason, last_event_at, updated_at)
--   ON sevensteps.notification_outbox TO sevensteps_runtime;
-- GRANT SELECT, INSERT ON sevensteps.notification_events TO sevensteps_runtime;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sevensteps.enquiry_rate_limits TO sevensteps_runtime;
-- GRANT SELECT ON sevensteps.enquiry_operator_inbox, sevensteps.enquiry_operator_recovery TO sevensteps_operator;
-- REVOKE ALL ON FUNCTION sevensteps.purge_enquiry_pii(uuid) FROM PUBLIC, sevensteps_runtime, sevensteps_operator;
-- Do not grant login roles ownership, BYPASSRLS, CREATE, or broad table privileges.

-- Retention operator procedure, after the owner sets the numeric PII policy:
-- 1. Read the target receipt and confirm the applicable deletion date.
-- 2. Call SELECT sevensteps.purge_enquiry_pii($1) with a privileged retention role.
--    The function refuses an active send lease, clears both PII copies, and keeps
--    dedup metadata for at least seven days after deletion. Retry after the lease
--    expires; never bypass it while an in-memory send may hold the payload.
-- 3. Remove related mailbox/export copies under their separately approved policy.
-- 4. After dedupe_until, delete the tombstone only when both PII copies are gone.
--    The database trigger enforces this. Signed expired submission tokens must
--    also be rejected by the HTTP layer, even after tombstone cleanup.
-- 5. A daily privileged maintenance run prunes expired rate buckets in batches
--    of 1000; runtime also prunes up to 100 per limiter operation. Monitor table
--    size. Delete orphan webhook metadata only after the approved provider-event
--    retention period and reconciliation window, in bounded batches. Keep event
--    metadata for attached outbox rows until that receipt's deletion. This policy
--    needs the owner's retention values before production activation.
-- Never paste enquiry rows, connection strings, or mail credentials into logs.
