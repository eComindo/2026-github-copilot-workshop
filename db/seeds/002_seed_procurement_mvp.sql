-- Seed data for Procurement MVP workshop baseline
-- Includes Home/Dashboard + PR module data and a small PO/GR sample chain.

BEGIN;

INSERT INTO purchase_requisitions (
  id,
  pr_number,
  status,
  requester_name,
  department_name,
  title,
  notes,
  needed_by_date
) VALUES
  (
    '11111111-1111-1111-1111-111111111001',
    'PR-2026-0001',
    'APPROVED',
    'Sari Lestari',
    'Maintenance',
    'Monthly MRO replenishment',
    'Spare parts for preventive maintenance.',
    CURRENT_DATE + INTERVAL '7 day'
  ),
  (
    '11111111-1111-1111-1111-111111111002',
    'PR-2026-0002',
    'SUBMITTED',
    'Budi Santoso',
    'Warehouse',
    'Safety and warehouse consumables',
    'Required for incoming shipment ramp-up.',
    CURRENT_DATE + INTERVAL '10 day'
  ),
  (
    '11111111-1111-1111-1111-111111111003',
    'PR-2026-0003',
    'DRAFT',
    'Nina Prasetyo',
    'Engineering',
    'Tooling replacement request',
    'Draft prepared for next approval cycle.',
    CURRENT_DATE + INTERVAL '14 day'
  )
ON CONFLICT (pr_number) DO NOTHING;

INSERT INTO pr_lines (
  id,
  pr_id,
  line_no,
  item_code,
  item_name,
  qty_requested,
  qty_allocated,
  qty_received,
  uom,
  est_unit_price,
  site_code,
  required_date,
  budget_center
) VALUES
  (
    '22222222-2222-2222-2222-222222222001',
    '11111111-1111-1111-1111-111111111001',
    1,
    'BRG-6205',
    'Bearing 6205',
    20,
    12,
    0,
    'PCS',
    85000,
    'JKT-PLANT',
    CURRENT_DATE + INTERVAL '7 day',
    'MNT-001'
  ),
  (
    '22222222-2222-2222-2222-222222222002',
    '11111111-1111-1111-1111-111111111001',
    2,
    'GLV-IND',
    'Industrial Safety Gloves',
    50,
    20,
    0,
    'PAIR',
    32000,
    'JKT-PLANT',
    CURRENT_DATE + INTERVAL '7 day',
    'MNT-001'
  ),
  (
    '22222222-2222-2222-2222-222222222003',
    '11111111-1111-1111-1111-111111111002',
    1,
    'TAPE-50',
    'Packing Tape 2 inch',
    120,
    0,
    0,
    'ROLL',
    11000,
    'SBY-WH',
    CURRENT_DATE + INTERVAL '10 day',
    'WH-OPS'
  ),
  (
    '22222222-2222-2222-2222-222222222004',
    '11111111-1111-1111-1111-111111111002',
    2,
    'MASK-KN95',
    'Mask KN95',
    200,
    0,
    0,
    'PCS',
    6500,
    'SBY-WH',
    CURRENT_DATE + INTERVAL '10 day',
    'WH-OPS'
  ),
  (
    '22222222-2222-2222-2222-222222222005',
    '11111111-1111-1111-1111-111111111003',
    1,
    'DRILL-13',
    'Electric Drill 13mm',
    4,
    0,
    0,
    'UNIT',
    975000,
    'JKT-ENG',
    CURRENT_DATE + INTERVAL '14 day',
    'ENG-CAPEX'
  )
ON CONFLICT (pr_id, line_no) DO NOTHING;

INSERT INTO purchase_orders (
  id,
  po_number,
  status,
  vendor_name
) VALUES
  (
    '33333333-3333-3333-3333-333333333001',
    'PO-2026-0001',
    'SUBMITTED',
    'PT Sumber Teknik Abadi'
  )
ON CONFLICT (po_number) DO NOTHING;

INSERT INTO po_lines (
  id,
  po_id,
  line_no,
  item_code,
  item_name,
  qty_ordered,
  qty_received,
  uom,
  unit_price,
  site_code,
  required_date
) VALUES
  (
    '44444444-4444-4444-4444-444444444001',
    '33333333-3333-3333-3333-333333333001',
    1,
    'BRG-6205',
    'Bearing 6205',
    12,
    0,
    'PCS',
    83000,
    'JKT-PLANT',
    CURRENT_DATE + INTERVAL '7 day'
  ),
  (
    '44444444-4444-4444-4444-444444444002',
    '33333333-3333-3333-3333-333333333001',
    2,
    'GLV-IND',
    'Industrial Safety Gloves',
    20,
    0,
    'PAIR',
    30000,
    'JKT-PLANT',
    CURRENT_DATE + INTERVAL '7 day'
  )
ON CONFLICT (po_id, line_no) DO NOTHING;

INSERT INTO pr_line_allocations (
  id,
  pr_line_id,
  po_line_id,
  allocated_qty
) VALUES
  (
    '55555555-5555-5555-5555-555555555001',
    '22222222-2222-2222-2222-222222222001',
    '44444444-4444-4444-4444-444444444001',
    12
  ),
  (
    '55555555-5555-5555-5555-555555555002',
    '22222222-2222-2222-2222-222222222002',
    '44444444-4444-4444-4444-444444444002',
    20
  )
ON CONFLICT (pr_line_id, po_line_id) DO NOTHING;

INSERT INTO goods_receipts (
  id,
  gr_number,
  po_id,
  status,
  receipt_date,
  notes
) VALUES
  (
    '66666666-6666-6666-6666-666666666001',
    'GR-2026-0001',
    '33333333-3333-3333-3333-333333333001',
    'DRAFT',
    CURRENT_DATE,
    'Draft receipt prepared for workshop demo.'
  )
ON CONFLICT (gr_number) DO NOTHING;

INSERT INTO gr_lines (
  id,
  gr_id,
  po_line_id,
  line_no,
  qty_received,
  actual_site_code
) VALUES
  (
    '77777777-7777-7777-7777-777777777001',
    '66666666-6666-6666-6666-666666666001',
    '44444444-4444-4444-4444-444444444001',
    1,
    5,
    'JKT-PLANT'
  )
ON CONFLICT (gr_id, line_no) DO NOTHING;

COMMIT;
