# ADR-0003: No game over — defeat is a setback, not deletion

- **Status:** accepted
- **Date:** 2025-11-08

## Context

A life-management app must never punish the user by destroying their data. But stakes are needed so neglect matters ("people staying on top of things").

## Options considered

1. Hard game over / save wipe on defeat.
2. Reputational only (broken pledges in Hansard, approval penalty, caretaker period).
3. Reputational + currency cost ("cost of the election").
4. Reputational + losing an upgrade.

## Decision

Options 2 + a light 3: approval hitting 0 mid-term triggers a **vote of no confidence** (automatic early election). **Defeat at the ballot** records undelivered pledges in Hansard as broken promises (lasting approval penalty + permanent stat), starts a short **caretaker period** (rewards halved), and charges a small flat **"cost of the election"** in £. Level, XP, honours, stats and history are kept. There is no lose state and no save deletion.

## Consequences

- Positive: stakes feel real; the player is never wiped; fits the "governments fall, the country carries on" framing.
- Negative/tradeoffs: caretaker period and election cost must be tuned so defeat stings without being punishing.
