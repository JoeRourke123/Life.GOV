import type { ExpoConfig } from 'expo/config';

/**
 * App config. `experiments.baseUrl` is set from EXPO_BASE_URL so the same
 * build can be hosted at the GitHub Pages subpath — CI sets
 * EXPO_BASE_URL=/<repo>/app (see .github/workflows/deploy-app.yml).
 * Locally (no EXPO_BASE_URL) the app serves from / as usual.
 */
export default ({ config }: { config: ExpoConfig }): ExpoConfig => ({
  ...config,
  name: 'Life.GOV',
  slug: 'lifegov',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#0b0c0c',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    // 'static' prerenders every route to HTML (+ 404.html), so deep links work
    // on GitHub Pages, which has no SPA fallback. SDK 58 defaults to 'single'.
    output: 'static',
  },
  plugins: ['expo-router'],
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_URL ? { baseUrl: process.env.EXPO_BASE_URL } : {}),
  },
});
