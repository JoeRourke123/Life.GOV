# v2 mockups

Screen mockups for issue #2, iterated from the v1 critique (issue #2 comment,
2026-11-08). Built as HTML/CSS sources in `src/`, rendered to PNG with Playwright.

## Design changes from v1

- Approval is the Commons chamber: a horseshoe of seats that fill with approval.
- Streak is a division-record tally, not a text line.
- Running order on the order paper: one red primary action (first business),
  the rest outline. Ministry bonuses surfaced on task cards.
- Gold reserved for elections, assent and ceremony (first-run commission,
  manifesto presentation, election night). Section headers are muted small caps.
- Sitting screen: clause document fills in as sittings complete; suspension
  is amber and deadpan, not an error red.
- Cabinet is a cabinet table with seats, level badges, and deadpan status lines.
- Orders render as an Order in Council certificate with seal; upkeep flagged.
- Treasury is a ledger (receipts, upkeep, settlements, net), not just a shop.
- Gazette choices show tone/risk hints; exact numbers land in Hansard.
- Manifesto over-cap is a negotiation (table anyway / withdraw), not a dead end.
- Player identity (Rt Hon. name, PM, level) in the dashboard header.
- New screens: first-run "form an Administration" and election-night result.
- 5-tab bar, 44px touch targets, 11px type floor.

## Re-render

```bash
cd docs/mockups/v2/src
npm i playwright && npx playwright install chromium
node render.mjs
```

Outputs land in `../phones/` and `../v2-sheet.png`.
