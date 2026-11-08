# Life.GOV Design System — "GOV.UK Play" (v1.0)

**Premise:** your life's government built you an actual service, and it happens to be a game. The design system extends the GOV.UK Design System faithfully — black header, phase banner, task lists, status tags, thick-bordered panels — and adds game components to that skeleton.

Reference mockups: `docs/mockups/v4/` (PR #8). Live kitchen sink: `docs/design-system/` (GitHub Pages).

---

## 1. Principles

1. **The service is the fiction.** No theme skin over generic UI. If GOV.UK wouldn't ship the component, we don't ship it — we extend it.
2. **State is a tag.** Everything's status is a coloured tag: Completed, In progress, Not started, Struck, Awaiting assent. One glance, one word.
3. **Consequences are recorded, never nagged.** A missed item is a red "Struck" tag and a Hansard line — not a guilt banner, not a notification storm.
4. **Ceremony is earned.** Thick-bordered green panels only for real moments: royal assent, a returned administration. Never for a single task.
5. **Deadpan throughout.** Copy is civil-service dry. Funny because it's dry, never slapstick, never exclamation marks.
6. **Smooth but honest.** Softened radii and tactile shadows, but no gradients, no glass, no glow, no decoration.

## 2. Tokens

### Colour

| Token | Value | Use |
|---|---|---|
| `--black` | `#0b0c0c` | Text, header bar, tab bar border |
| `--secondary` | `#505a5f` | Secondary text, hints, inactive tabs |
| `--border` | `#b1b4b6` | Hairlines, list dividers, meter tracks |
| `--light` | `#f3f2f1` | Stat cards, phase banner, secondary buttons |
| `--green` | `#00703c` | Primary buttons, success tags, meters |
| `--green-dark` | `#002d18` | Button hard shadow |
| `--blue` | `#1d70b8` | Links, inset bars, notification banners, in-progress tags |
| `--red` | `#d4351c` | Warnings, struck items, over-budget, event mode |
| `--red-dark` | `#55150b` | Warning button shadow, event header |
| `--yellow` | `#ffdd00` | "Awaiting assent" tag only (black text) |

Colour is semantic. Green = success/money, blue = in-progress/links, red = failure/warning, yellow = pending ceremony. Never decorative.

### Type

- **Family:** Hanken Grotesk (stand-in for GDS Transport). Weights 400/500/600/700/800.
- **Mono:** IBM Plex Mono 500/600 — clock and tabular figures only.
- **Scale:** display 31/800 · section 20/700 · title 16.5/600 · body 15.5/400 · sub 13/500 · tag 12/700 · small 13/400.
- **Sentence case everywhere.** No all-caps labels. The only exception is AYES/NOES figures.

### Spacing & shape

- Screen padding 20px; section gap 30px; row padding 13–15px.
- Radius: 4px (buttons, tags, cards, figures), 3px (meters, inputs, checkboxes). Never larger.
- Shadows: buttons only — hard `0 2px 0` darker shade. Nothing else casts a shadow.
- Touch targets ≥ 44px. Body line-height 1.45–1.5.

## 3. Components

### GovHeader
Black bar: crown crest (SVG), `LIFE.GOV` wordmark (800), right meta (identity + level). **Event mode:** background `--red-dark`, meta reads the event name.

### PhaseBanner
Light grey strip under the header. Left: `<b>Parliament 3</b> · Day 9 of 14`. Right: mini progress bar (8px, green fill) or a status word. Doubles as the turn tracker; every screen shows it.

### Tag
`Completed` green · `In progress` blue · `Not started` grey · `Struck` red · `Awaiting assent` yellow. 12px/700, 4px radius, white text (black on yellow). One tag per row.

### TaskList
The core list component (order paper, day's business, clauses, briefs). Rows: title (16.5/600) + sub (13/500 secondary) + tag + optional chevron. Hairline dividers, 14px padding. Section headings are 20/700 sentence case.

### Button
Full-width, 50px min-height, 17/700, 4px radius, hard 2px shadow:
- **Primary** green `#00703c`, shadow `--green-dark`. One per view.
- **Secondary** `--light` bg, black text, black shadow.
- **Warning** red, shadow `--red-dark`. Destructive/defiant actions only.
- Button rows: primary + secondary side by side, 12px gap.

### Panel
Thick 5px green border, 20px padding. Green 27/800 title + 16px body. **Assent and election results only.** If you're tempted to use it for a streak, close the editor.

### InsetText
10px blue left bar, secondary text. The record: official notices, rules, quotes from the whips. Bold for the operative phrase.

### WarningText
10px red left bar + red 19/800 title. Reserved for events that are genuinely happening (market breaks, emergency statements). If it's on screen, the situation is real.

### NotificationBanner
5px blue border. Gazette stories arrive in these, with an underlined action link. Dismissible; never stacked more than one.

### SummaryList
Key/value rows with hairlines. Key 14/600 secondary (118px column), value 16.5/600 with 13px sub, action link right-aligned (blue, underlined). Cabinet, consequences, resolutions, envelopes.

### Meter / XPBar
Approval: 14px track (`--light`, `--border`), green fill, black marker at the value; AYES/NOES figures above. XP: 9px track, blue fill. No animation on load beyond 150ms ease-out.

### StatCard
`--light` bg, 4px radius, centred: 11.5/700 caps label + 22/800 figure. Used in rows of 2–4. The sitting clock gets the wide card (mono 34/600).

### Checkbox (Standing Orders)
27px, 2px black border, 3px radius. On: green fill + white check. Standing orders are enactable law — ticking is legislating, with the cost printed in the sub-line.

### Input
50px, 2px black border, 3px radius, 18/600 text. Label 16/700 above, hint 14/400 secondary between label and field.

### TabBar
White, 2px black top border. Five tabs: No. 10 · Orders · Cabinet · Gazette · Ledger. Line icons (19px, 1.5 stroke) over 10.5/700 labels. Active: black + 4px green top bar. Icons never change colour semantically; active state only.

### Figure (charts)
1px `--border` border, 4px radius, 12px padding. SVG charts: hairline axes, faint gridlines, blue receipts / red spending / hatched deficit area. Caption row: description left, `Fig. N` right, 11.5/600 secondary.

## 4. Motion

- Press: button translates down 2px, shadow collapses (the hard shadow is the affordance).
- Transitions: 150ms ease-out. No springs, no bounces, no confetti.
- Tag changes: instant. The record doesn't animate.
- Event mode: header crossfades to `--red-dark` over 300ms. Nothing else moves.

## 5. Accessibility

- Contrast: all text pairs meet WCAG AA (black/white 19.6:1, secondary/white 7.5:1, white on green 5.9:1, white on blue 5.4:1, white on red 4.6:1 — large/bold only on red).
- Never colour alone: every tag has a word, every meter has figures.
- Dynamic type: layout uses rem-like scaling; tags and buttons grow with type.
- VoiceOver: task rows announce title → sub → tag as one element.

## 6. React Native mapping

- Fonts loaded via `expo-font`; tokens in `theme.ts` mirroring §2.
- TaskList → `FlatList`; tags and buttons as shared primitives in `components/gov/`.
- Meters/figures: `react-native-svg` (polyline, pattern fill for hatching).
- Event mode: a context that themes GovHeader + PhaseBanner.
