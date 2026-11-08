# v4 mockups — "GOV.UK Play"

Alternate design direction for issue #2: a faithful extension of the **GOV.UK
design system**, gamified. Sources in `src/`, rendered to PNG with Playwright.

## The idea

Life.GOV should feel like the government of your life actually built you a
service. v4 keeps the GOV.UK skeleton intact and adds game components to it:

### GOV.UK skeleton (kept)
- Black header bar with crest and wordmark; white text
- Phase banner under the header (repurposed as parliament progress)
- Task list rows with status tags (Completed / In progress / Not started)
- Thick-bordered confirmation panel (royal assent, election result)
- Inset text with blue left bar (the record), warning text with red bar (events)
- Summary lists with underlined "Reshuffle" action links
- GOV.UK buttons: green with hard 2px shadow, grey secondary, red warning
- Sentence case everywhere; Hanken Grotesk as the GDS Transport stand-in

### Game additions to the skeleton
- **Phase banner as turn tracker**: "Parliament 3 · Day 9 of 14" + mini progress bar
- **Approval meter**: green fill with a black marker, labelled AYES/NOES
- **XP bar** and level in the header meta
- **Notification banners** for Gazette stories, with action links
- **Stat cards** for the sitting clock and fiscal headline figures
- **Checkbox standing orders**: the app's settings are enactable law
- **Event mode**: the header turns dark red for a market emergency
- Charts in GOV.UK palette (blue receipts, red spending, hatched deficit)

### Smooth feel
- 4px radii on buttons, tags, meters, figures (softened from GOV.UK's sharp corners)
- Hard 2px button shadows (the GOV.UK tactile press)
- Generous spacing, 44px+ touch targets, sentence case labels

## Screens

1. `01-dashboard` — today's business, approval meter, Gazette banner
2. `02-order-paper` — task list with sections and status tags
3. `03-sitting` — committee clock, clause task list, divide/adjourn
4. `04-cabinet` — summary list of ministers with reshuffle actions
5. `05-orders` — standing orders as checkboxes with enact costs
6. `06-gazette` — notification banner lead + in-brief task list
7. `07-budget` — stat cards, deficit chart, envelopes summary list
8. `08-market-event` — emergency statement, gilt yield chart, reckoning
9. `09-election-night` — confirmation panel result + resolutions
10. `10-first-run` — form an administration: commission, name input, start button

## Re-render

```bash
cd docs/mockups/v4/src
npm i playwright && npx playwright install chromium
node render.mjs
```

Outputs per-screen PNGs to `../phones/` and composes `../v4-sheet.png`.
