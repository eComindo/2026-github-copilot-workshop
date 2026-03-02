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

5. Bootstrap workshop database (schema + sample data):

```bash
docker compose down -v
docker compose up -d db
```

Bootstrap files used by all participants:
- `db/migrations/001_init_procurement_mvp.sql`
- `db/seeds/002_seed_procurement_mvp.sql`
- `docker/postgres/init/00-init-mvp-db.sh`

Cross-OS readiness note:
- Workshop bootstrap supports Windows, macOS, and Linux participants by enforcing LF line endings for `.sh` and `.sql` via `.gitattributes`.
- If the DB init script cannot execute on a participant machine, run:

```bash
chmod +x docker/postgres/init/00-init-mvp-db.sh
docker compose down -v
docker compose up -d db
```

6. Quick verification:

```bash
docker compose exec -T db psql -U workshop -d procurement_mvp -c "SELECT pr_number, status FROM purchase_requisitions ORDER BY pr_number;"
```

> aside positive
>
> We pre-provide baseline migration + seed and run them automatically via Docker init so everyone starts with the same working dataset.

---

## DB Bootstrap for Participants
Duration: 5

Use this reset flow if your local DB state is inconsistent, or before each new workshop batch:

```bash
docker compose down -v
docker compose up -d db
```

What this does:
- Recreates PostgreSQL volume from scratch
- Applies baseline schema migration
- Inserts workshop sample data for Home/Dashboard + PR baseline
- Runs via container init script (`/docker-entrypoint-initdb.d/00-init-mvp-db.sh`) to keep bootstrap behavior consistent across OS hosts

Verification command:

```bash
docker compose exec -T db psql -U workshop -d procurement_mvp -c "SELECT COUNT(*) FROM purchase_requisitions;"
```

---

## Configure Local `.env` Credentials (Baseline Required)
Duration: 10

Create backend `.env`:

```env
PORT=3000
DATABASE_URL=postgres://workshop:workshop@localhost:5433/procurement_mvp
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

## API Readiness Check with Swagger (Early Checkpoint)
Duration: 15

Goal:
- Validate backend API is running before PO implementation starts
- Let participants practice asking Copilot to generate API docs view
- Make available endpoints visible in one place

Participant task:
1. Ask Copilot to add Swagger/OpenAPI to the Fastify backend.
2. Run backend and open Swagger UI in browser.
3. Confirm baseline PR endpoints are listed and callable.

Prompt example for Copilot:

```text
Add Swagger/OpenAPI support to this Fastify JavaScript backend.
Use @fastify/swagger and @fastify/swagger-ui.
Register plugins in the main server/bootstrap file,
expose docs at /docs, and include all existing routes in the generated OpenAPI spec.
Keep implementation simple for workshop participants.
```

Verification steps:

```bash
# backend terminal
npm install @fastify/swagger @fastify/swagger-ui
npm run dev
```

Open in browser:
- `http://localhost:3000/docs`

Ready criteria:
- Swagger page loads successfully
- Existing baseline PR endpoints are visible
- At least one endpoint can be tried successfully from Swagger UI

> aside positive
>
> This gives participants a fast confidence check that API contracts are live before building PO features.

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

## Figma MCP Setup (Before PO Build)
Duration: 10

Before implementing PO module pages, make sure Figma MCP is available in Copilot.

Checklist:
- Confirm Figma MCP is installed/available in current Copilot environment
- Confirm access to workshop Figma file and node/page IDs
- Confirm participants can call MCP from Copilot chat

Prompt example:

```text
Check that Figma MCP is available in this environment.
If available, show the steps to generate Vue code from the provided Figma node for PO Create page.
Keep the output beginner-friendly.
```

Expected result:
- Everyone is ready to generate PO Create UI from the same Figma source

---

## Generate PO Create Page from Figma (via Figma MCP)
Duration: 20

Participants start the PO module by generating **PO Create page** from Figma using MCP.

Scope for generated page:
- Header section (vendor, PO date, notes)
- Line table section (approved PR open lines, allocate qty, unit price)
- Actions (save draft, submit)

Prompt example:

```text
Using Figma MCP, generate Vue code for the PO Create page from the provided Figma node.
Include reusable components for header form and line allocation table.
Do not implement API calls yet.
Keep structure simple for workshop participants.
```

Expected result:
- PO Create page and base UI components are generated from Figma

---

## Add Unit Tests for Figma-generated Vue Components
Duration: 15

Once PO Create page/components are generated, ask participants to add component-level unit tests.

Minimum test targets:
1. Header component renders required fields
2. Line table component adds/removes line rows
3. Allocation input blocks invalid values at UI validation layer

Prompt example:

```text
Create unit tests for the generated Vue PO Create components.
Focus on rendering, line add/remove behavior, and basic allocation input validation.
Keep tests simple and readable for beginners.
```

Expected result:
- Participants see how Copilot generates tests for UI components before API integration

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
- PO Create page (already generated from Figma MCP, now wire to API)
- PO Detail page

Prompt example:

```text
Implement PO list/detail pages in Vue using existing baseline patterns.
For PO Create page, keep the generated Figma components and wire them to purchase order APIs.
Keep UI simple for workshop clarity.
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

## Create Dedicated Playwright Spec for PO Module
Duration: 12

Before running Playwright, participants create one dedicated E2E spec file for the PO module built in previous slides.

Target file:
- `tests/e2e/po-module.spec.js`

Required scenarios:
1. Happy path: create + submit PO from baseline approved PR data
2. Negative path: reject over-allocation qty

Prompt example:

```text
Create tests/e2e/po-module.spec.js using @playwright/test.
Add:
1) happy path: create + submit PO from approved PR and verify PO detail
2) negative path: reject allocation qty that exceeds PR remaining qty
Use stable selectors and clear assertions.
```

Expected outcome:
- Participants understand test intent before execution
- One dedicated PO module spec is ready to run

---

## Add Playwright E2E Test
Duration: 20

Run the dedicated PO spec and check the generated artifacts:

```mermaid
flowchart LR
   A[Use Existing Approved PR] --> B[Open PO Create]
   B --> C[Allocate PR Open Lines]
   C --> D[Submit PO]
   D --> E[Open PO Detail]
   E --> F[Verify PO Status and Quantities]
   F --> G[Open HTML Report]
   G --> H[Inspect Screenshots, Traces, Videos]
```

Flow summary: create PO spec -> run Playwright -> verify PO result -> inspect report and artifacts.

Prompt example:

```text
Refine tests/e2e/po-module.spec.js for readability and stable selectors.
Keep two scenarios only: happy path and over-allocation rejection.
```

Run commands:

```bash
npx playwright test tests/e2e/po-module.spec.js
npx playwright show-report
```

Artifact locations:
- HTML report: `playwright-report/index.html`
- Screenshots, traces, videos: `test-results/`

How participants open artifacts:
- VS Code Explorer: open `playwright-report/` and `test-results/`
- Terminal (macOS):

```bash
open playwright-report/index.html
open test-results
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
