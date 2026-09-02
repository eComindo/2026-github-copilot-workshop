# Procurement MVP Runbook (PO Backlog)

This runbook validates `docs/plan.md` for MVP execution and defines a strict
PO-focused delivery sequence with hard checkpoints.

## MVP Validation Verdict

The plan is **valid for MVP** and correctly scoped to PR baseline + PO backlog
with GR as out-of-scope for workshop delivery.

Current implementation alignment:

| Plan area | Status | Notes |
|---|---|---|
| PO API + data rules (Hour 2) | Complete | PO create/submit/detail/open-lines implemented with service validations |
| PO UI pages (Hour 3) | Complete | PO list/create/detail pages wired in router and API client |
| PO unit tests (Hour 4, Jest) | Complete | Over-allocation + status-transition coverage exists |
| PO e2e flow (Hour 4, Playwright) | Incomplete | `tests/e2e/` PO scenario not present yet |
| Done Criteria §10 | Partially complete | Playwright checkpoint still open |

## Strict Task Sequence with Checkpoints

1. **Freeze MVP scope to PO backlog only**  
   Confirm no GR expansion, no extra modules, no tech-stack drift.
   **Checkpoint:** Scope note captured in active task/PR description.

2. **Lock backend PO rule completion**  
   Ensure PO service enforces allocation and status-transition rules and PO
   routes remain thin handlers.
   **Checkpoint:** Existing PO Jest tests remain green for these rules.

3. **Lock frontend PO flow completion**  
   Ensure PO list/create/detail remain connected to backend APIs and approved PR
   line allocation flow works end-to-end in UI behavior.
   **Checkpoint:** PO pages load, create, and submit path is functional.

4. **Implement missing Playwright PO journey**  
   Add `tests/e2e/po-flow.spec.js` for: baseline approved PR data -> PO create
   -> PO submit -> PO detail assertions.
   **Checkpoint:** Playwright executes at least one meaningful PO-focused flow.

5. **Harden repository hygiene for generated artifacts**  
   Add `graphify-out/` to `.gitignore` while keeping `.graphifyignore` tracked.
   **Checkpoint:** Generated graph artifacts are excluded from commit scope.

6. **Sync plan documentation with implemented reality**  
   Update `docs/plan.md` workshop-status markers so PO backlog is marked done
   where implementation is already complete.
   **Checkpoint:** Plan status text matches current code state.

7. **Run final MVP acceptance gate (PO-focused)**  
   Re-check Done Criteria §10 against delivered scope.
   **Checkpoint:** All PO criteria pass, including Jest + Playwright evidence.

## Complete Refined Checklist

Use this as the mandatory sign-off gate before closing PO backlog work.

### Implementation Quality
- [ ] Stays within PO-only scope (no GR/SSO/reporting/notification creep)
- [ ] Matches workshop stack (Fastify + JavaScript, PostgreSQL, Vue 3 + Vite)
- [ ] Keeps business rules in services; route handlers remain thin
- [ ] Enforces PO over-allocation guard (`allocation <= PR remaining`)
- [ ] Uses explicit naming and existing UI patterns

### Testing Discipline
- [ ] PO Jest tests cover over-allocation and status transitions
- [ ] Existing backend/frontend test commands remain passing
- [ ] Playwright includes PO create -> submit -> detail flow
- [ ] No new testing framework complexity beyond Jest + Playwright

### Documentation Discipline
- [ ] `docs/plan.md` reflects actual PO backlog completion state
- [ ] API scope docs remain aligned with implemented PO endpoints
- [ ] README/AGENTS updates are made only when behavior/scope changed
- [ ] Commit messages are clear, concise, and explain intent
