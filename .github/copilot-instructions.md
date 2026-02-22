# Copilot Instructions for This Workshop

## Objective
Build a procurement MVP for a 5-hour workshop that demonstrates Copilot usage across SDLC.

Reference plan: `docs/plan.md`.

## Scope Constraints (Strict)
- Build only PR -> PO -> GR workflow.
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
- Implement only the endpoints listed in `docs/plan.md`.
- Enforce status transitions:
	- PR: `DRAFT -> SUBMITTED -> APPROVED`
	- PO: `DRAFT -> SUBMITTED`
	- GR: `DRAFT -> POSTED`
- Enforce validations:
	1) PO allocation qty <= PR line remaining qty
	2) GR received qty <= PO line open qty

## Code Style Guidance
- Keep files short and readable for workshop participants.
- Use explicit naming; avoid clever patterns.
- Include basic request validation and clear error responses.
- Favor service functions for business rules and thin route handlers.

## Testing Expectations
- Add focused Jest tests for business validations.
- Add one Playwright happy-path test for PR -> PO -> GR flow.
- Do not over-invest in test framework complexity.

## Workshop-First Principle
When there is a trade-off between production robustness and workshop clarity, choose workshop clarity.
