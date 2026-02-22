-- Baseline schema for Procurement MVP workshop
-- Use this file as the single source of truth for initial database structure.

CREATE TABLE IF NOT EXISTS purchase_requisitions (
  id UUID PRIMARY KEY,
  pr_number VARCHAR(30) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED')),
  requester_name VARCHAR(120) NOT NULL,
  department_name VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  notes TEXT,
  needed_by_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pr_lines (
  id UUID PRIMARY KEY,
  pr_id UUID NOT NULL REFERENCES purchase_requisitions(id) ON DELETE CASCADE,
  line_no INT NOT NULL,
  item_code VARCHAR(60) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  qty_requested NUMERIC(14,2) NOT NULL CHECK (qty_requested > 0),
  qty_allocated NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (qty_allocated >= 0),
  qty_received NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (qty_received >= 0),
  uom VARCHAR(20) NOT NULL,
  est_unit_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (est_unit_price >= 0),
  site_code VARCHAR(50) NOT NULL,
  required_date DATE,
  budget_center VARCHAR(60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pr_id, line_no)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY,
  po_number VARCHAR(30) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED')),
  vendor_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS po_lines (
  id UUID PRIMARY KEY,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  line_no INT NOT NULL,
  item_code VARCHAR(60) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  qty_ordered NUMERIC(14,2) NOT NULL CHECK (qty_ordered > 0),
  qty_received NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (qty_received >= 0),
  uom VARCHAR(20) NOT NULL,
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  site_code VARCHAR(50) NOT NULL,
  required_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (po_id, line_no)
);

CREATE TABLE IF NOT EXISTS pr_line_allocations (
  id UUID PRIMARY KEY,
  pr_line_id UUID NOT NULL REFERENCES pr_lines(id) ON DELETE CASCADE,
  po_line_id UUID NOT NULL REFERENCES po_lines(id) ON DELETE CASCADE,
  allocated_qty NUMERIC(14,2) NOT NULL CHECK (allocated_qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (pr_line_id, po_line_id)
);

CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY,
  gr_number VARCHAR(30) NOT NULL UNIQUE,
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'POSTED')),
  receipt_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gr_lines (
  id UUID PRIMARY KEY,
  gr_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  po_line_id UUID NOT NULL REFERENCES po_lines(id) ON DELETE RESTRICT,
  line_no INT NOT NULL,
  qty_received NUMERIC(14,2) NOT NULL CHECK (qty_received > 0),
  actual_site_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gr_id, line_no)
);

CREATE INDEX IF NOT EXISTS idx_pr_lines_pr_id ON pr_lines(pr_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_po_id ON po_lines(po_id);
CREATE INDEX IF NOT EXISTS idx_allocations_pr_line_id ON pr_line_allocations(pr_line_id);
CREATE INDEX IF NOT EXISTS idx_allocations_po_line_id ON pr_line_allocations(po_line_id);
CREATE INDEX IF NOT EXISTS idx_gr_lines_gr_id ON gr_lines(gr_id);
