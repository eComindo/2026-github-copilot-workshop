author: Arie M. Prasetyo
summary: GitHub Copilot Workshop - 5 Hours Procurement MVP (VS Code + GitHub)
id: github-copilot-workshop-id
categories: AI, Development
environments: Web
status: Published
feedback link: https://example.com/feedback

# GitHub Copilot Workshop: Build a Procurement MVP

## About this workshop
Duration: 10

Welcome! In this workshop, participants build a real-world procurement MVP using GitHub Copilot in both VS Code and GitHub.

Application scope:
- Baseline provided: Home/Dashboard + PR module (list/create/detail + APIs)
- Participant backlog: PO module (list/create/detail + APIs)
- Optional extension: Bookmark feature (`PR | PO | GR`) via GitHub Issue workflow
- Further exploration: GR module (self-paced after workshop)

Tech stack:
- Backend: Fastify + JavaScript
- Frontend: Vue 3 + Vite + JavaScript
- Database: PostgreSQL in Docker
- Testing: Jest + Playwright
- Design: Figma + Figma MCP


---

## Workshop Flow (No Back-and-Forth)
Duration: 10

To keep focus and reduce context switching, we use 3 blocks only:

1. **GitHub block (0-60 min)**
   - Repo setup
   - Copilot Spaces for onboarding + brainstorming
   - Confirm MVP and implementation plan

2. **VS Code block (60-225 min)**
   - Deliver PO backlog with Copilot
   - Add PO-focused Jest + Playwright tests

3. **GitHub block (225-300 min)**
   - PR summary + Copilot review
   - Code scanning and CodeQL analysis
   - Wrap-up and next steps

> aside positive
>
> This structure keeps participants in one tool long enough to build momentum.

---

## Prerequisites
Duration: 10

- VS Code latest
- GitHub account + Copilot license
- Docker Desktop running
- Node.js 20+
- Git
- GitHub Copilot extension

Optional MCP tools:
- GitHub MCP Server
- Figma MCP integration available in Copilot/agent environment

---

## Project Setup (GitHub Block)
Duration: 15

1. Fork workshop repository
2. Clone locally

```bash
git clone https://github.com/<your-org-or-user>/<repo>.git
cd <repo>
git checkout -b feature/procurement-mvp
```

3. Ensure project references:
- `docs/plan.md`
- `.github/copilot-instructions.md`

4. Start PostgreSQL:

```bash
docker compose up -d db
```

5. Apply the pre-provided baseline migration (required):

```bash
docker compose exec -T db psql -U workshop -d procurement_mvp < db/migrations/001_init_procurement_mvp.sql
```

Migration file used by all participants:
- `db/migrations/001_init_procurement_mvp.sql`

> aside positive
>
> We pre-provide the baseline migration so everyone uses the same schema and we avoid workshop delays from migration drift.

---

## Configure Local `.env` Credentials (Baseline Required)
Duration: 10

Create backend `.env`:

```env
PORT=3000
DATABASE_URL=postgres://workshop:workshop@localhost:5432/procurement_mvp
```

Create frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Run baseline apps and verify prebuilt modules:

```bash
# backend
npm run dev

# frontend (new terminal)
npm run dev
```

Baseline expectation:
- Home/Dashboard works
- PR list/create/detail pages work
- PR APIs already connected to provided database

---

## Use GitHub Spaces for Onboarding + Brainstorming
Duration: 20

Open Copilot Spaces on GitHub and create a space named:
`Procurement MVP Onboarding`

Attach these files:
- `README.md`
- `docs/plan.md`
- `.github/copilot-instructions.md`

Prompt 1 (new team member onboarding):

```text
Create a new team member onboarding summary for this repository.
Explain the business flow (PR -> PO -> GR), tech stack, and first 3 tasks to start contributing.
```

Prompt 2 (product brainstorming):

```text
For this procurement MVP, suggest 5 realistic enhancements for a future version.
Keep current workshop scope unchanged and clearly mark each enhancement as out-of-scope for today.
```

Output to keep in repo:
- `docs/onboarding.md` (optional)
- `docs/brainstorm.md` (optional)

---

## Finalize Plan Before Coding
Duration: 15

Use Copilot Chat (Plan mode) with `docs/plan.md` attached.

Prompt:

```text
Validate this plan for a 5-hour JavaScript workshop.
Return a strict task sequence with checkpoints every 30-45 minutes.
Assume Home/Dashboard and PR module are already provided; focus implementation on PO backlog.
```

Then switch to Agent mode:

```text
Save the refined checklist to docs/runbook.md.
```

---

## Figma MCP: Design-to-Code Exercise
Duration: 20

This step is optional in the new strategy because PR module is already provided in baseline.

Target page for Figma MCP in this workshop:
**PR Create page** (best balance of complexity and business value).

Why this page:
- Shows realistic enterprise form + line items table
- Reusable UI patterns for PO/GR pages
- Clear mapping from design to API payload

Suggested facilitator prompt:

```text
Using Figma MCP, generate Vue UI code for a Purchase Requisition Create page.
Include: header fields, dynamic line items table, add/remove row action, submit button.
Use simple workshop styling and keep component structure beginner-friendly.
```

Expected result:
- Base Vue component scaffold from Figma
- Participants compare generated output with existing baseline PR implementation

---

## VS Code Build Block: Baseline Review + PO Backlog Start
Duration: 25

Context for participants:
- Do not scaffold from zero.
- Use repository baseline as-is (DB + Home/Dashboard + PR module already working).

Tasks:
- Explore existing project structure.
- Identify extension points for PO routes/services/pages.
- Confirm existing API client and page routing patterns.

Prompt example:

```text
Analyze this repository and summarize what is already implemented.
Assume dashboard and PR module are complete.
Propose a minimal implementation plan for PO list/create/detail pages and PO endpoints only.
```

---

## Implement PO Module (Backlog Core)
Duration: 45

PO endpoints (participant scope):
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/submit`
- `GET /api/purchase-orders/:id`
- `GET /api/purchase-orders/:id/open-lines`

Required PO rule:
1. PO allocation qty <= PR line remaining qty

Prompt example:

```text
Implement purchase order module in Fastify JavaScript.
Create PO service + routes for create, submit, detail, and open-lines.
Enforce over-allocation validation against PR remaining quantities.
Return 422 for business rule violations with clear messages.
```

---

## Build PO Pages and Connect to API
Duration: 35

PO pages (participant scope):
- PO List page
- PO Create page (from approved PR open lines)
- PO Detail page

Prompt example:

```text
Add PO list/create/detail pages in Vue using the existing baseline patterns.
Connect pages to purchase order APIs and keep UI simple for workshop clarity.
```

---

## Add PO-focused Jest Tests
Duration: 20

Minimum tests:
1. Reject over-allocation in PO creation
2. Reject invalid PO status transition
3. Accept valid allocation and transition path

Prompt example:

```text
Create Jest tests focused on PO service validation and status transition rules.
Do not add GR tests in this workshop scope.
```

---

## Slide: Bookmark Feature (Part 1 - Create GitHub Issue)
Duration: 8

Goal:
- Treat Bookmark as post-backlog optional extension.
- Drive implementation from a GitHub Issue (not ad-hoc coding).

Task:
- Create Issue: "Add Bookmark feature for PR/PO/GR".
- Ask Copilot on GitHub to draft acceptance criteria and technical checklist.

Prompt example:

```text
Create a GitHub Issue for an optional Bookmark feature in this procurement app.
Scope: user can bookmark PR/PO/GR entity from detail page.
Include acceptance criteria, backend tasks, frontend tasks, and migration task.
Keep this outside mandatory workshop backlog.
```

---

## Slide: Bookmark Feature (Part 2 - Implement from Issue: Migration + API)
Duration: 12

Task:
- Use the Issue as single source of truth.
- Generate and apply SQL migration.
- Implement minimal backend model/repository/service/routes.

Suggested endpoints:
- `POST /api/bookmarks`
- `GET /api/bookmarks?user=<name>`
- `DELETE /api/bookmarks/:id`

Prompt example:

```text
Using the GitHub Issue acceptance criteria, implement bookmarks backend in Fastify JavaScript.
Generate migration SQL and add routes for create/list/delete bookmarks.
Validate entity_type as PR|PO|GR and prevent duplicate bookmark per user+entity.
```

---

## Slide: Bookmark Feature (Part 3 - Implement from Issue: Frontend)
Duration: 12

Task:
- Add bookmark button/icon on PR/PO/GR detail pages.
- Implement toggle behavior based on backend API.
- Keep UI minimal and consistent with baseline.

Prompt example:

```text
Using the GitHub Issue checklist, add bookmark toggle button/icon to PR/PO/GR detail pages.
Wire to bookmarks APIs and show bookmarked vs not-bookmarked state.
Keep implementation simple and workshop-friendly.
```

---

## Add Playwright E2E Test
Duration: 20

Create one PO-focused test on top of baseline PR data:

```mermaid
flowchart LR
   A[Use Existing Approved PR] --> B[Open PO Create]
   B --> C[Allocate PR Open Lines]
   C --> D[Submit PO]
   D --> E[Open PO Detail]
   E --> F[Verify PO Status and Quantities]
```

Flow summary: use seeded/baseline approved PR -> create PO -> submit PO -> verify PO detail values.

Prompt example:

```text
Create one Playwright end-to-end test focused on PO backlog flow.
Use baseline approved PR data, then create and submit PO, and assert status + quantities on PO detail page.
Keep selectors stable and assertions clear.
```

---

## Further Exploration (Optional): GR Module
Duration: 10

Not part of mandatory workshop backlog.

Self-paced challenge:
- Implement GR create/detail/post endpoints
- Build GR list/create/detail pages
- Add validation: received qty <= PO open qty

Use `docs/plan.md` as implementation reference.

---

## GitHub Block: PR Summary + Copilot Review
Duration: 20

1. Push branch and open Pull Request
2. Use Copilot to generate PR summary
3. Request Copilot code review as reviewer
4. Triage comments and apply fixes in a small follow-up commit

Prompt on PR page:

```text
Summarize this PR by grouping changes into backend, frontend, tests, and documentation.
Highlight risks and follow-up tasks.
```

---

## GitHub Block: Code Quality, Code Scanning, CodeQL
Duration: 25

### Enable and run checks
- Enable GitHub Advanced Security features available in your environment
- Enable Code Scanning
- Enable CodeQL analysis

### Add workflow (if not present)
Create `.github/workflows/codeql.yml` using Copilot.

Prompt example:

```text
Create a GitHub Actions workflow for JavaScript CodeQL analysis.
Run on push and pull_request for main and feature branches.
```

### Teach participants to read results
- Security tab -> Code scanning alerts
- Understand severity, affected file, and remediation guidance
- Differentiate true positives vs acceptable risk for MVP

> aside positive
>
> For workshop speed, fix 1 meaningful alert together rather than trying to clear everything.

---

## Wrap-up, Retrospective, and Next Steps
Duration: 10

What participants accomplished:
- Started from a working baseline with JavaScript stack
- Delivered PO backlog module end-to-end
- Used Copilot Spaces for onboarding + brainstorming
- Added PO-focused unit tests and Playwright e2e
- Used GitHub Copilot review + CodeQL/code scanning

Suggested next iteration:
- Add role-based authorization
- Add pagination and filtering
- Add better error boundary handling
- Add CI for Jest + Playwright in GitHub Actions

Resources:
- GitHub Copilot docs: https://docs.github.com/copilot
- Copilot Spaces: https://github.com/copilot/spaces
- CodeQL docs: https://docs.github.com/code-security/code-scanning/introduction-to-code-scanning/about-codeql
- Playwright docs: https://playwright.dev

Great work!
