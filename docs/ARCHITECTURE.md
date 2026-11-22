# Velocity — Private Collection & Buyer Inquiry Architecture

- `src/collection/collectionRules.ts` — Canonical vehicle inventory (`FULL_COLLECTION_SOURCE`), gateway-boundary redaction of private vault pricing and chassis numbers (`projectVehicleForAccess`), viewing window expiry check (`isAppointmentWindowExpired`), and buyer input validation (`validateBuyerInquiry`).
- `src/collection/collectionGateway.ts` — `LocalCollectionGateway` supporting idempotent lead creation, duplicate-lead rejection per email + vehicle, sold-vehicle protection (`VEHICLE_UNAVAILABLE`), concierge vault-access unlock + viewing slot proposals, and token-protected appointment confirmation.
- `src/components/NewsletterCTA.tsx` — Structured private-access and viewing inquiry form assigning the marque advisor and issuing a dossier reference + access token.
- `src/pages/AccessPortal.tsx` (`/access`) — Verified buyer portal for unlocking private vault pricing, confirming proposed viewing slots, filtering inventory by category, and comparing up to two vehicles side-by-side.
- `src/pages/ConciergeDesk.tsx` (`/concierge`) — Staff concierge desk for reviewing buyer dossiers, unlocking vault access, proposing salon viewing slots, and managing live vehicle availability (`available` / `reserved` / `sold`).
