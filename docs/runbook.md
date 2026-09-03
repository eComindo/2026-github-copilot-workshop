# PO Backlog Runbook Checklist

Purpose: use this as the strict execution checklist for workshop MVP implementation focused on Purchase Order (PO) only.

Scope lock:
- [ ] PO-only scope confirmed (list/create/detail UI + required PO APIs).
- [ ] GR implementation explicitly out of scope for this sprint.
- [ ] Workshop-first principle applied when trade-offs appear.

## 1) Implementation Quality
- [ ] Changes stay within PO module goals from [docs/plan.md](docs/plan.md).
- [ ] API behavior remains compatible with PO endpoints in [docs/plan.md](docs/plan.md).
- [ ] Business rules are enforced in services, not duplicated in routes.
- [ ] Allocation rule enforced: allocation qty <= PR line remaining qty.
- [ ] Route handlers are thin, validate inputs, and return clear errors.
- [ ] Naming and file/module size remain explicit and teachable.

Checkpoint A (implementation gate):
- [ ] Manual PO flow works end-to-end: list -> create -> detail -> submit.

## 2) Testing
- [ ] Unit tests cover PO happy paths and failure paths.
- [ ] Unit tests include status transition rules (DRAFT -> SUBMITTED + invalid transitions).
- [ ] Unit tests include over-allocation rejection and boundary case acceptance.
- [ ] E2E test covers PO list/create/detail against seeded PR data.
- [ ] Changed tests and relevant suites pass locally before handoff.

Checkpoint B (test gate):
- [ ] Backend PO tests pass.
- [ ] Frontend PO flow test passes.

## 3) Documentation Discipline
- [ ] Endpoint behavior changes are reflected in [docs/plan.md](docs/plan.md) or noted in PR summary.
- [ ] Assumptions and simplifications are documented briefly for workshop clarity.
- [ ] User-visible error cases are documented in code comments or route notes.
- [ ] Change summary states implemented scope, excluded scope, and rationale.

Checkpoint C (documentation gate):
- [ ] Summary is complete and consistent with [AGENTS.md](AGENTS.md) constraints.

## Ready-to-Close Criteria
- [ ] All checkpoints A, B, and C are checked.
- [ ] No GR feature work was added.
- [ ] PO backlog objective is demonstrable in the running app.
