CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY,
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('PR', 'PO', 'GR')),
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_bookmarks_entity ON bookmarks(entity_type, entity_id);
