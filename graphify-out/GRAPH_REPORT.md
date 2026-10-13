# Graph Report - .  (2026-10-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 91 nodes · 129 edges · 18 communities (9 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c392a3d9`
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
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `api` - 8 edges
2. `getPurchaseOrderById()` - 6 edges
3. `createPurchaseOrder()` - 6 edges
4. `getRequisitionById()` - 6 edges
5. `createRequisition()` - 5 edges
6. `submitPurchaseOrder()` - 4 edges
7. `buildApp()` - 3 edges
8. `config` - 3 edges
9. `listPurchaseOrders()` - 3 edges
10. `getOpenPoLines()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `start()` --calls--> `buildApp()`  [EXTRACTED]
  backend/src/server.js → backend/src/app.js

## Import Cycles
- None detected.

## Communities (18 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (11): purchaseOrderRoutes(), requisitionRoutes(), createPoNumber(), createPurchaseOrder(), getOpenPoLines(), getPurchaseOrderById(), listPurchaseOrders(), mapHeader() (+3 more)

### Community 1 - "Community 1"
Cohesion: 0.30
Nodes (9): approveRequisition(), createPrNumber(), createRequisition(), getRequisitionById(), getRequisitionOpenLines(), listRequisitions(), mapHeader(), submitRequisition() (+1 more)

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (5): addLine(), emptyLine(), errorMessage, form, router

### Community 3 - "Community 3"
Cohesion: 0.43
Nodes (3): buildApp(), config, start()

## Knowledge Gaps
- **12 isolated node(s):** `00-init-mvp-db.sh script`, `router`, `errorMessage`, `form`, `items` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api` connect `Community 5` to `Community 2`, `Community 7`, `Community 8`, `Community 9`, `Community 10`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `buildApp()` connect `Community 3` to `Community 0`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `00-init-mvp-db.sh script`, `router`, `errorMessage` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._