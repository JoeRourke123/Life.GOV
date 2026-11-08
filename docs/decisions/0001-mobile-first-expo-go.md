# ADR-0001: Mobile-first with React Native + Expo, developed in Expo Go

- **Status:** accepted
- **Date:** 2025-11-08

## Context

Life.GOV is a personal life-management system; it must live in the pocket, not at a desk. The original repo description mentioned a React Router web app, but the product is daily-use mobile. Home-screen widgets and quick-add shortcuts would be valuable but require a native dev build.

## Options considered

1. React Router web app only.
2. React Native + Expo with a dev build (full native module access).
3. React Native + Expo developed in **Expo Go** (SDK core only).

## Decision

Option 3: React Native + Expo, developed in Expo Go for now. Expo Router for navigation, AsyncStorage/expo-sqlite for persistence, expo-notifications for the day cycle, PMQs and election countdown. Web export via Expo is possible later; the web idea is sequenced, not abandoned.

## Consequences

- Positive: fastest path to a runnable app on real devices; no Xcode/Android Studio needed; Expo SDK core covers everything in the MVP.
- Negative/tradeoffs: home-screen widgets and quick-add shortcuts are deferred until a dev build phase; some native-only features unavailable.
