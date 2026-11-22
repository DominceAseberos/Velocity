# P20 — VELOCITY Roadmap

- **Audit Date:** 2026-11-21 (Asia/Shanghai)
- **Owner:** Domince Aseberos
- **Portfolio Entry:** VELOCITY
- **Evidence & Current Classification:** Local source reviewed; simulated access inquiry
- **Recommended Priority:** Sequence 4 (Reuse proven inquiry/operator patterns)

---

## 1. Observed Evidence & Current State

React/Vite/TypeScript; `NewsletterCTA.tsx:37–40` validates email then explicitly simulates successful inquiry. No network call is present in that component.

---

## 2. Product Direction & Stack Decision

- **Product Goal:** Private vehicle collection discovery and managed buyer inquiries.
- **Stack & Integration Decision:** Keep existing React, motion, form/schema dependencies, and UI. Add an inquiry gateway and integrate the dealer's current CRM/DMS if present. Existing dealer inventory should remain the source of vehicle availability.

---

## 3. Ordered Development Workflow

1. Define vehicle details, availability, specifications, and permitted public pricing.
2. Add useful filters, comparisons, and saved inquiry selections.
3. Persist private-access/test-drive requests and assign a staff owner.
4. Give staff inquiry status and appointment management.
5. Later: verified buyer portal and document exchange.

---

## 4. Failure Cases & Acceptance Criteria

Vehicle sold after selection, duplicate leads, missing inventory, and expired appointment windows. Protect genuinely private inventory on the server rather than hiding it in UI. Document inventory provenance, access-review states, and contact permissions.

---

## Delivery Sequence & Stage Gates

| Stage | Concrete Output | Exit Gate |
| --- | --- | --- |
| **A — Establish baseline** | Correct source/branch, current commands, inventory of implemented vs. simulated flows | One selected user journey and current limitations documented |
| **B — Product definition** | Actors, data, states, MVP, and acceptance scenarios | Customer and operator agree on result ownership |
| **C — Stack and integration decision** | Existing-stack inventory and one short provider/architecture decision | Known source of truth for identity, content, and transactions |
| **D — One complete vertical slice** | UI, validation, adapter, endpoint/provider, persistence, and operator action | Happy path and primary failure path work |
| **E — Reliability** | Conflict handling, uncertain-write recovery, permissions, and meaningful tests | Critical acceptance scenarios pass |
| **F — Documentation and evidence** | Updated docs, controlled demo data, and repeatable walkthrough | Another developer can run and explain the product |
| **G — Portfolio update** | Honest label, case study, links, and proof | Claims correspond to implemented/tested behavior |
| **H — Further expansion** | Next business capability | Added only after core workflow remains stable |

---

## Shared Engineering & Completion Standards

### Completion Criteria (Before Updating Portfolio Label)
- Core workflow passes in a fresh session using controlled data.
- Relevant operator can receive and manage the result.
- Invalid inputs, unavailable dependencies, and uncertain writes have recoverable behavior.
- Authorization and critical business constraints are enforced beyond the UI.
- Reload, deep-link, and back navigation preserve correct state.
- Keyboard/mobile layouts, focus, dialog behavior, and reduced motion are checked.
- CI runs relevant lint/type/build and meaningful flow tests.
- Documentation matches actual implementation and explicitly identifies fixtures/sandbox integrations.
- Case-study claims link to evidence; performance and conversion improvements have measurements.

### Required Documentation Artifacts (Sized to Product)
- `README.md` — Product purpose, users, honest status, setup, env var names, commands, and demo limits
- `docs/PRODUCT.md` — Problem, actors, core workflow, MVP, later scope, success measures, exclusions
- `docs/ARCHITECTURE.md` — Modules, responsibilities, dependencies, data flow, state ownership, tradeoffs
- `docs/FLOWS.md` — Customer and operator flows, transitions, failure recovery, access rules
- `docs/FORMS.md` — Fields, constraints, consent, submission endpoint, notification routing, UI states
- `docs/API.md` (or OpenAPI) — Request/response shapes, auth, errors, idempotency, provider contracts
- `docs/DATA.md` — Entities, persistence, indexes, lifecycle, migrations, retention, backup/restore
- `docs/TESTING.md` — Commands, fixtures, critical scenarios, hardware/browser coverage, evidence
- `docs/OPERATIONS.md` — Deployment, secrets setup, health checks, logs, recovery, rollback
- `docs/decisions/` — Short ADRs for meaningful stack/provider/architecture choices
- `docs/CASE_STUDY.md` — Problem, decisions, verified workflows, screenshots, limitations, measured results

---

## 7. Local Evidence References

- `Velocity/src/components/NewsletterCTA.tsx`
