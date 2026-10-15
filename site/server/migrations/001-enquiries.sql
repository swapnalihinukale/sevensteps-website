-- Apply with a migration role in the intended application schema.
-- Timestamps are UTC instants. Receipt metadata contains no enquiry payload.
CREATE TABLE enquiry_receipts (
  receipt uuid PRIMARY KEY,
  outbox_id uuid NOT NULL UNIQUE,
  form_version text NOT NULL CHECK (length(form_version) BETWEEN 1 AND 64),
  token_id text NOT NULL CHECK (length(token_id) BETWEEN 1 AND 256),
  fingerprint text NOT NULL CHECK (length(fingerprint) BETWEEN 1 AND 256),
  created_at timestamptz NOT NULL,
  dedupe_until timestamptz NOT NULL,
  pii_deleted_at timestamptz,
  UNIQUE (form_version, token_id),
  CHECK (dedupe_until >= created_at + interval '7 days')
);

CREATE TABLE enquiries (
  receipt uuid PRIMARY KEY REFERENCES enquiry_receipts(receipt) ON DELETE RESTRICT,
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE notification_outbox (
  id uuid PRIMARY KEY,
  receipt uuid NOT NULL UNIQUE REFERENCES enquiry_receipts(receipt) ON DELETE CASCADE,
  payload jsonb CHECK (payload IS NULL OR jsonb_typeof(payload) = 'object'),
  provider_key text NOT NULL UNIQUE,
  provider_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN
    ('pending', 'sending', 'accepted', 'delivery_delayed', 'delivered', 'bounced', 'failed', 'complained', 'needs_reconciliation')),
  created_at timestamptz NOT NULL,
  next_attempt_at timestamptz NOT NULL,
  first_attempt_at timestamptz,
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count BETWEEN 0 AND 6),
  lease_owner text,
  lease_until timestamptz,
  last_reason text CHECK (last_reason IS NULL OR length(last_reason) <= 80),
  last_event_at timestamptz,
  updated_at timestamptz NOT NULL,
  CHECK ((lease_owner IS NULL) = (lease_until IS NULL)),
  CHECK ((status = 'sending') = (lease_owner IS NOT NULL)),
  CHECK (attempt_count = 0 OR first_attempt_at IS NOT NULL)
);
CREATE INDEX notification_outbox_due ON notification_outbox(next_attempt_at, created_at)
  WHERE status IN ('pending', 'sending');

-- Store only the verified event's operational identifiers, type and time.
-- Unknown provider IDs can arrive before the send response is saved.
CREATE TABLE notification_events (
  event_id text PRIMARY KEY CHECK (length(event_id) BETWEEN 1 AND 256),
  provider_id text NOT NULL CHECK (length(provider_id) BETWEEN 1 AND 256),
  event_type text NOT NULL CHECK (event_type IN ('sent', 'delivered', 'bounced', 'failed', 'complained', 'delivery_delayed')),
  occurred_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX notification_events_provider ON notification_events(provider_id, occurred_at);

CREATE TABLE enquiry_rate_limits (
  key_hash text NOT NULL CHECK (key_hash ~ '^[A-Fa-f0-9]{64}$'),
  window_ms bigint NOT NULL CHECK (window_ms > 0),
  bucket_start timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  hits integer NOT NULL CHECK (hits > 0),
  PRIMARY KEY (key_hash, window_ms, bucket_start)
);
CREATE INDEX enquiry_rate_limits_expiry ON enquiry_rate_limits(expires_at);

CREATE FUNCTION protect_notification_identity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id OR NEW.receipt IS DISTINCT FROM OLD.receipt
    OR NEW.provider_key IS DISTINCT FROM OLD.provider_key
    OR (NEW.payload IS DISTINCT FROM OLD.payload AND NEW.payload IS NOT NULL) THEN
    RAISE EXCEPTION 'Notification identity and payload are immutable';
  END IF;
  IF OLD.provider_id IS NOT NULL AND NEW.provider_id IS DISTINCT FROM OLD.provider_id THEN
    RAISE EXCEPTION 'Notification provider identity is immutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER notification_identity BEFORE UPDATE ON notification_outbox
  FOR EACH ROW EXECUTE FUNCTION protect_notification_identity();

CREATE FUNCTION retain_receipt_metadata() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF clock_timestamp() < OLD.dedupe_until OR EXISTS (SELECT 1 FROM enquiries WHERE receipt = OLD.receipt)
    OR EXISTS (SELECT 1 FROM notification_outbox WHERE receipt = OLD.receipt AND payload IS NOT NULL) THEN
    RAISE EXCEPTION 'Receipt retention has not elapsed';
  END IF;
  RETURN OLD;
END;
$$;
CREATE TRIGGER receipt_retention BEFORE DELETE ON enquiry_receipts
  FOR EACH ROW EXECUTE FUNCTION retain_receipt_metadata();

-- A PII deletion clears both copies and starts a fresh seven-day dedup window.
-- This privileged operation is excluded from the runtime/read-only grants.
CREATE FUNCTION purge_enquiry_pii(target_receipt uuid) RETURNS boolean LANGUAGE plpgsql AS $$
DECLARE affected integer;
BEGIN
  PERFORM 1 FROM enquiry_receipts WHERE receipt = target_receipt FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  PERFORM 1 FROM notification_outbox WHERE receipt = target_receipt FOR UPDATE;
  IF EXISTS (SELECT 1 FROM notification_outbox WHERE receipt = target_receipt
    AND status = 'sending' AND lease_until > clock_timestamp()) THEN
    RAISE EXCEPTION 'Wait for the active notification lease before deleting PII';
  END IF;
  UPDATE notification_outbox SET payload = NULL,
    status = CASE WHEN status IN ('pending', 'sending') THEN 'needs_reconciliation' ELSE status END,
    last_reason = CASE WHEN status IN ('pending', 'sending') THEN 'pii_deleted' ELSE last_reason END,
    lease_owner = NULL, lease_until = NULL, updated_at = clock_timestamp()
    WHERE receipt = target_receipt;
  DELETE FROM enquiries WHERE receipt = target_receipt;
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected > 0 THEN
    UPDATE enquiry_receipts SET pii_deleted_at = clock_timestamp(),
      dedupe_until = GREATEST(dedupe_until, clock_timestamp() + interval '7 days')
      WHERE receipt = target_receipt;
  END IF;
  RETURN affected > 0;
END;
$$;
REVOKE ALL ON FUNCTION purge_enquiry_pii(uuid) FROM PUBLIC;
