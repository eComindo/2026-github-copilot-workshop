# Copilot Instructions for This Workshop

## Objective
Build a procurement management system with core modules for Purchase Requisition (PR), Purchase Order (PO), and Goods Receipt (GR).
A procurement system manages how a company buys things, with control and traceability from request to receiving.

The modules for a MVP (minimum viable product) procurement system include:
- **Purchase Requisition (PR)**: Employees request items/services, which are reviewed and approved by managers.
- **Purchase Order (PO)**: Approved requisitions are converted into purchase orders sent to suppliers, tracking order details and status.
- **Goods Receipt (GR)**: When items are delivered, a goods receipt is created to confirm what was received, update inventory, and trigger payment.

In this workshop, we focus on using a prebuilt baseline and a add a backlog sprint.

Reference plan: `docs/plan.md`. Always check `docs/plan.md` before large changes.

## Scope Constraints (Strict)
- Baseline provided in repo: database schema + Home/Dashboard + PR module (list/create/detail + required PR APIs).
- Participant implementation scope: PO module only (PO list/create/detail + PO APIs + PO validations).
- GR module is out of implementation scope during the workshop and treated as further exploration.
- Keep business scope minimal and teachable.
- Avoid enterprise-only features (SSO, workflow engine, reporting, notifications, advanced compliance).
- Prefer clarity and small modules over abstraction-heavy architecture.

## Technology Decisions (Do Not Change)
- Backend: Fastify + JavaScript
- API style: REST JSON
- Database: PostgreSQL (Docker local)
- Frontend: Vue 3 + Vite + JavaScript
- Unit test: Jest
- E2E test: Playwright
- Do not use Prisma.

## API Requirements
- Maintain compatibility with endpoints listed in `docs/plan.md`.
- For participant backlog, prioritize PO endpoints:
	- `POST /api/purchase-orders`
	- `POST /api/purchase-orders/:id/submit`
	- `GET /api/purchase-orders/:id`
	- `GET /api/purchase-orders/:id/open-lines`
- Enforce PO rule: allocation qty <= PR line remaining qty.
- GR endpoints/rules can be left untouched during workshop implementation.

## Code Style Guidance
- Keep files short and readable for workshop participants.
- Use explicit naming; avoid clever patterns.
- Include basic request validation and clear error responses.
- Favor service functions for business rules and thin route handlers.

## Testing Expectations
- Add focused Jest tests for PO business validations (especially over-allocation and status transition).
- Add Playwright coverage focused on PO pages/flow integrated with existing baseline PR data.
- Do not over-invest in test framework complexity.

## User Interface Guidelines
- Follow the existing UI patterns established in the baseline for consistency.
- Always respect the CSS variables set in the baseline for colors, spacing, and typography.
- Never use emojis in the UI or commit messages. Create a custom SVG icon if needed for visual emphasis.

## Delivery Checklist (Definition of Done)
Use this checklist for each PO backlog item before marking it complete.

### Implementation Quality
- Scope remains within PO module and required PO endpoints in `docs/plan.md`.
- Route handlers are thin; business rules are implemented in service functions.
- Request payloads are validated with clear 4xx responses for user errors.
- PO rules are enforced, especially allocation qty <= PR line remaining qty.
- Status transitions are explicit, and invalid transitions are rejected.

### Testing Discipline
- Add or update focused Jest tests for each changed PO rule.
- Cover happy path and failure path (including over-allocation and invalid submit transition).
- Keep tests deterministic with seeded baseline data.
- Run affected unit tests and PO-related Playwright flow before completion.

### Documentation Discipline
- Update `docs/plan.md` when PO API contracts, validations, or behavior change.
- Update `README.md` or `docs/runbook.md` when setup or run commands change.
- Document assumptions and known limitations in PR/issue notes.
- Keep endpoint names and examples consistent across code, tests, and docs.

## Optional Extension
- Bookmark feature (PR|PO|GR) is an optional post-backlog exercise and should be driven via GitHub Issue creation workflow.

## Workshop-First Principle
When there is a trade-off between production robustness and workshop clarity, choose workshop clarity.
