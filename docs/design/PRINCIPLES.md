# Design principles & craft rules

The working rules behind "GOV.UK Play" (see [SYSTEM.md](SYSTEM.md)). Written down so future screens don't drift.

## Against AI slop

Learned the hard way across v1–v3 (see issue #2). The tells, and the rule that fixes each:

| Slop tell | Rule |
|---|---|
| Decorative gradients on heroes | Colour is semantic only. If it isn't a state (success/pending/failure), it's black, white, grey or one of the five tokens. |
| Chip-heavy rows | One tag per row. Tags carry state, never vibes. |
| Stacked rounded cards everywhere | Structure comes from hairline rules, lists and whitespace. Cards exist exactly once: the stat card, and only in rows. |
| Every screen shouting | Exactly one primary button per view. Everything else is secondary, a link, or nothing. |
| Guilt-framed penalties ("You missed 3 days! 😔") | Consequences are recorded as facts. "Struck at midnight. Recorded in Hansard." The record is colder and more motivating than any nudge. |
| Urgency colour on countdowns | The election is a notice in the phase banner and an inset, never a red badge. |
| Reward candy on every row | Rewards are paid once, in the record ("£10 paid · 20 XP" in the sub-line). No confetti, no coin showers. |
| Generic placeholder copy | Every string is written in the deadpan civil-service voice. "The House moves on." |

**The one-question test:** would a real government service (or document) ship this element? If not, it doesn't go in.

## Anti-enshittification commitments

Product rules the design enforces, so the game doesn't decay into a slot machine:

1. **No variable-reward loops.** Rewards are fixed and printed before the action ("£10 · 20 XP"). No loot boxes, no random multipliers.
2. **No streak-shaming.** A broken streak is a fact in the record, not a push notification with a sad face.
3. **Notifications are minutes of proceedings**, not marketing: midnight agenda, Wednesday PMQs, election notice. Nothing else. No "we miss you" pings.
4. **No pay-to-govern.** No currency sold for real money, ever. The fund is earned by work.
5. **You can always see the whole state.** No hidden meters, no dark-pattern scarcity. The ledger shows everything.
6. **Failure is survivable and on the record.** Elections happen, markets break, but there is no game over and no save deletion. History is legible, not hidden.

## Craft rules

- **Sentence case everywhere.** All-caps is reserved for AYES/NOES figures.
- **Two fonts, no more.** Hanken Grotesk for everything; IBM Plex Mono for the clock and tabular figures.
- **Numbers before adjectives.** "£134 spent — over by £14" beats "slightly over budget".
- **The hard shadow is the button.** `0 2px 0` darker shade; press collapses it. No ripple, no glow.
- **One primary action per view.** The rest is secondary, a link, or silence.
- **Hairlines before boxes.** Reach for a divider before a border, a border before a card.
- **Ceremony is scarce.** The green panel appears twice a term, not twice a day. Scarcity is what makes assent feel like assent.
- **Deadpan is the tone, not a skin.** If a string needs an exclamation mark, rewrite it until it doesn't.

## Process

- Mockups are HTML/CSS sources rendered with Playwright (`docs/mockups/v4/src/`), not static images — every screen is reproducible and diffable.
- Each design iteration gets a branch, a PR, and a critique comment on issue #2 before anything is implemented.
- Components land in the app only when they exist in [SYSTEM.md](SYSTEM.md) and the kitchen sink.
