# v3 mockups — "Hansard Press"

Screen mockups for issue #2, third iteration. Built as HTML/CSS sources in
`src/`, rendered to PNG with Playwright.

## The system

The app is an official document. Every screen reads as a piece of UK official
print — Hansard, the Order Paper, an election declaration, a ledger — rather
than a phone app with cards on it.

## Anti-slop rules (enforced in `base.css`)

- No cards, no shadows, no gradients, no border-radius, no glass, no glow.
  Structure comes from hairline rules, tables, whitespace, and ink density.
- Two type voices only: the paper (STIX Two Text serif) and the record
  (IBM Plex Mono). No third family anywhere.
- Palette: paper `#f6f3ea`, ink `#1d1a15`, red `#a12c1c` (despatch box and
  stamps only), green `#2f5e44` (the ayes / money), ochre `#8a6c1e`
  (assent / ceremony). Nothing else.
- Colour is semantic, never decorative. No urgency colour on notices.
- Hatched fills (repeating-linear-gradient) are permitted: they read as
  print texture, not decoration.

## Anti-enshittification commitments

- Consequences are recorded as facts in Hansard, never nagged. A struck item
  is a ledger line ("Expense claim struck at midnight — RECORDED"), not a
  guilt banner.
- The election countdown is stated as an official notice, not a red badge.
- Rewards are paid once per action, shown in the record; no candy on rows.
- Over-capacity (more than 5 pledges) is a printed caution, not an error
  state.

## Screens

1. `01-dashboard` — No. 10 masthead, writ notice, State of the House division bar
2. `02-order-paper` — the day's business as an order paper (SIs, PMBs, bills)
3. `03-sitting` — committee stage: mono clock, clause table, division progress
4. `04-cabinet` — ministers as a cabinet table (office / minister / level / effect)
5. `05-orders` — standing orders as numbered enactable rules with stamps
6. `06-gazette` — the Gazette as a broadsheet with drop cap and In Brief column
7. `07-treasury` — the consolidated fund as a ledger (particulars / receipt / payment)
8. `08-manifesto` — resolutions of the administration, term-length selector
9. `09-election-night` — declaration of the result of the poll
10. `10-first-run` — the commission: sign your name, form the administration
11. `11-budget` — the Budget: receipts vs spending, deficit chart, departmental envelopes, fiscal rules
12. `12-spending-review` — departmental variance, unfunded commitments, options before the House
13. `13-market-event` — emergency statement: gilt yields spike when pledges are unfunded

## Fiscal mechanics

Money is your actual finances, not a score. The Treasury tab holds three layers:

- **The ledger** — every transaction recorded like a real account book.
- **The Budget** — departments (life areas) receive spending envelopes; receipts
  (work done) vs spending is charted; the deficit is stated as a fact and
  hatched on the chart. Fiscal rules bind the administration.
- **The Spending Review** — variance per department, unfunded commitments
  flagged by the examiners, and three honest options: reallocate, save, or
  borrow.
- **The market event** — if unfunded commitments accumulate, the gilt market
  breaks: yields spike, sterling falls, approval collapses, envelopes are cut
  by order, and the record is permanent. Withdraw or proceed; the market
  decides next.

## Re-render

```bash
cd docs/mockups/v3/src
npm i playwright && npx playwright install chromium
node render.mjs
```

Outputs per-screen PNGs to `../phones/` and composes `../v3-sheet.png`.
