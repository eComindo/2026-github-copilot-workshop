# Graph Report - /Users/martianlogi/Documents/training/github/repo/2026-github-copilot-workshop  (2026-09-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 78 nodes · 103 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19a616fa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]

## God Nodes (most connected - your core abstractions)
1. `getPurchaseOrderById()` - 6 edges
2. `createPurchaseOrder()` - 6 edges
3. `getRequisitionById()` - 6 edges
4. `createRequisition()` - 5 edges
5. `submitPurchaseOrder()` - 4 edges
6. `api` - 4 edges
7. `config` - 3 edges
8. `listPurchaseOrders()` - 3 edges
9. `getOpenPoLines()` - 3 edges
10. `listRequisitions()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  backend/src/server.js → backend/src/app.js

## Import Cycles
- None detected.

## Communities (14 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.21
Nodes (9): createPoNumber(), createPurchaseOrder(), getOpenPoLines(), getPurchaseOrderById(), listPurchaseOrders(), mapHeader(), mapLine(), submitPurchaseOrder() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.27
Nodes (9): approveRequisition(), createPrNumber(), createRequisition(), getRequisitionById(), getRequisitionOpenLines(), listRequisitions(), mapHeader(), submitRequisition() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.24
Nodes (6): errorMessage, items, loading, errorMessage, items, api

### Community 3 - "Community 3"
Cohesion: 0.36
Nodes (3): buildApp(), config, start()

### Community 4 - "Community 4"
Cohesion: 0.29
Nodes (5): addLine(), emptyLine(), errorMessage, form, router

## Knowledge Gaps
- **13 isolated node(s):** `00-init-mvp-db.sh script`, `router`, `errorMessage`, `form`, `items` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `Community 2` to `Community 4`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `00-init-mvp-db.sh script`, `router`, `errorMessage` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._