-- Allow poll as a content_blocks type
ALTER TABLE content_blocks DROP CONSTRAINT IF EXISTS chk_content_blocks_type;
ALTER TABLE content_blocks ADD CONSTRAINT chk_content_blocks_type
  CHECK (type IN ('hero', 'about', 'experience', 'skill', 'project', 'contact', 'blog_post', 'poll'));

-- One row per anonymous vote. voter_token identifies a browser (cookie-based,
-- not a person) so the unique constraint blocks double-submits from the same
-- browser without requiring auth. Trivially bypassed by clearing cookies —
-- acceptable for a public blog poll, not a fraud-proof ballot.
CREATE TABLE poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES content_blocks(id) ON DELETE CASCADE,
  option_index integer NOT NULL,
  voter_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, voter_token)
);

CREATE INDEX idx_poll_votes_poll_id ON poll_votes (poll_id);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Anonymous readers may cast a vote but never list votes directly (that would
-- expose every voter_token). Aggregate counts are exposed separately below
-- via poll_results, which is not RLS-restricted since it only ever returns
-- a poll_id/option_index/votes rollup.
CREATE POLICY "anon_insert" ON poll_votes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth_all" ON poll_votes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE VIEW poll_results AS
  SELECT poll_id, option_index, count(*)::int AS votes
  FROM poll_votes
  GROUP BY poll_id, option_index;

GRANT SELECT ON poll_results TO anon, authenticated;

-- This view intentionally stays SECURITY DEFINER (the linter's
-- security_definer_view finding here is expected, not an oversight): a
-- security_invoker view would need an anon SELECT policy on poll_votes
-- itself to return anything, which would expose every individual
-- voter_token row via the public REST API -- strictly worse for privacy
-- than the current setup, where poll_results is the only way to read
-- vote counts at all.
COMMENT ON VIEW poll_results IS 'Intentionally SECURITY DEFINER -- see migration comment above.';
