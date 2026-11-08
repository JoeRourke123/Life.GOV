/**
 * Root layout — loads the design-system fonts, holds the splash until ready,
 * and mounts the router with the event-mode provider.
 */
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { EventModeProvider } from '@/components/gov/event-mode';
import { startDayCycle } from '@/state/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Boot wiring (ADR-0004): hydrate the save from lifegov/save.md, then roll the
  // day on boot and on every return to the foreground.
  useEffect(() => startDayCycle(), []);

  const [fontsLoaded] = useFonts({
    'HG-400': require('../assets/fonts/HankenGrotesk-400.ttf'),
    'HG-500': require('../assets/fonts/HankenGrotesk-500.ttf'),
    'HG-600': require('../assets/fonts/HankenGrotesk-600.ttf'),
    'HG-700': require('../assets/fonts/HankenGrotesk-700.ttf'),
    'HG-800': require('../assets/fonts/HankenGrotesk-800.ttf'),
    'PlexMono-500': require('../assets/fonts/IBMPlexMono-500.ttf'),
    'PlexMono-600': require('../assets/fonts/IBMPlexMono-600.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <EventModeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </EventModeProvider>
  );
}
