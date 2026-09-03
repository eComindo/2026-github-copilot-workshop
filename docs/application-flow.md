# Procurement MVP Application Flow

## Overview

The application is a Vue 3 and Vite frontend backed by a Fastify REST API and PostgreSQL. It currently supports two business modules:

- **Purchase Requisition (PR):** create, list, view, submit, and approve requisitions.
- **Purchase Order (PO):** list, create from approved PR lines, view details, submit, and inspect open quantities.

Goods Receipt (GR) is not implemented in the current workshop scope.

## Application structure

### Frontend

The Vue application uses Vue Router and keeps HTTP calls in `frontend/src/api.js`. The main routes are:

| Route | Purpose |
| --- | --- |
| `/` | Dashboard with requisition summary data |
| `/requisitions` | PR list |
| `/requisitions/new` | Create a PR |
| `/requisitions/:id` | PR detail, submit, and approve actions |
| `/purchase-orders` | PO list |
| `/po-create` | Create a PO from approved PR lines |
| `/purchase-orders/:id` | PO detail, submit action, and open lines |

The PO create screen uses the reusable `POHeaderForm` and `POLineAllocationTable` components. The table loads only approved requisition lines with remaining quantities. Individual line selection, order quantity, unit price, and delivery date are sent back to the page model before submission.

### Backend

Fastify registers the database plugin, requisition routes, and purchase-order routes. Services contain the database queries and business rules. The API returns JSON and converts non-success responses into frontend errors through the shared API client.

Important PO endpoints:

- `GET /api/purchase-orders` — list POs.
- `POST /api/purchase-orders` — create a draft PO from approved PR lines.
- `GET /api/purchase-orders/:id` — return the PO header, lines, and PR allocations.
- `POST /api/purchase-orders/:id/submit` — change a draft PO to submitted.
- `GET /api/purchase-orders/:id/open-lines` — return lines with quantity still open for receipt.

## Business rules

1. A PO can use only approved PR lines.
2. `qtyOrdered` must be greater than zero.
3. `qtyOrdered` must not exceed the PR line's remaining quantity.
4. Duplicate references to the same PR line are aggregated before validation.
5. PO creation runs in a database transaction and locks the relevant PR lines while checking allocations.
6. A draft PO can be submitted once; invalid transitions return an error.

## User flow

```mermaid
flowchart TD
    A["Open Procurement MVP"] --> B["Dashboard"]
    B --> C["Create or open Purchase Requisition"]
    C --> D["Enter requester, department, title, dates, and lines"]
    D --> E["Save PR"]
    E --> F["Submit PR"]
    F --> G["Manager opens PR detail"]
    G --> H{"PR approved?"}
    H -->|"No"| I["Keep PR in current state"]
    H -->|"Yes"| J["Open Purchase Orders"]
    J --> K["Start New PO"]
    K --> L["Load approved PR lines with open quantities"]
    L --> M["Select one or more PR lines"]
    M --> N["Enter vendor, order quantity, price, and delivery date"]
    N --> O{"Quantity within remaining amount?"}
    O -->|"No"| P["Show validation error and keep PO form open"]
    P --> N
    O -->|"Yes"| Q["Save draft or submit PO"]
    Q --> R["View PO list"]
    R --> S["Open PO detail"]
    S --> T["Review allocations and open receipt quantities"]
    T --> U["Submit draft PO if needed"]
```

## PO creation sequence

The sequence below describes the main integration path used by the PO create page. The page first finds approved PRs, then requests each PR's open lines. On submission, the backend validates the allocation inside a transaction before creating the PO and its allocation records.

```mermaid
sequenceDiagram
    actor User
    participant Vue as Vue PO Create Page
    participant API as api.js
    participant Fastify as Fastify API
    participant Service as Purchase Order Service
    participant DB as PostgreSQL

    User->>Vue: Open /po-create
    Vue->>API: listRequisitions()
    API->>Fastify: GET /api/requisitions
    Fastify->>DB: Read requisitions
    DB-->>Fastify: Requisition records
    Fastify-->>API: Approved PR summaries
    API-->>Vue: Approved PRs

    loop For each approved PR
        Vue->>API: getRequisitionOpenLines(prId)
        API->>Fastify: GET /api/requisitions/{prId}/open-lines
        Fastify->>DB: Read PR lines and allocations
        DB-->>Fastify: Open PR lines
        Fastify-->>API: Open lines and PR metadata
        API-->>Vue: Render selectable table rows
    end

    User->>Vue: Select line and enter PO data
    User->>Vue: Save draft or submit PO
    Vue->>API: createPurchaseOrder(payload)
    API->>Fastify: POST /api/purchase-orders
    Fastify->>Service: Validate and create PO
    Service->>DB: Begin transaction and lock PR lines
    Service->>DB: Check approval and remaining quantity

    alt Allocation is invalid
        DB-->>Service: Quantity or approval violation
        Service-->>Fastify: Throw HTTP 422 error
        Fastify-->>API: Error message
        API-->>Vue: Display validation error
    else Allocation is valid
        Service->>DB: Insert PO header, PO lines, and allocations
        Service->>DB: Commit transaction
        DB-->>Service: Created PO
        Service-->>Fastify: PO detail
        Fastify-->>API: Created PO
        API-->>Vue: Navigate to /purchase-orders
    end

    opt User submits the draft
        Vue->>API: submitPurchaseOrder(poId)
        API->>Fastify: POST /api/purchase-orders/{id}/submit
        Fastify->>Service: Validate status transition
        Service->>DB: Update PO status
        DB-->>Service: Updated PO
        Service-->>Fastify: Submitted PO
        Fastify-->>API: Submitted PO
        API-->>Vue: Show submitted status
    end
```

## Testing and delivery checks

- Backend unit tests use Jest and cover PO allocation and status-transition rules.
- Frontend component tests use Vitest and Vue Test Utils.
- PO E2E tests use Playwright for the happy path and over-allocation path.
- Playwright HTML reports are written to `playwright-report/`.
- Screenshots, traces, videos, and JSON results are written to `test-results/`.
- The pre-push hook runs the root `npm test` command and blocks a push if the test command fails.
