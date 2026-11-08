/**
 * Local notifications — DESIGN.md §2/§10. expo-notifications scheduled locally:
 * works in Expo Go (no dev build needed for local scheduling). Web: no-op.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function setupChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

/** Schedule a local notification `seconds` from now. Returns the notification id (null on web). */
export async function scheduleIn(seconds: number, title: string, body: string): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  await setupChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      channelId: 'default',
    },
  });
}

/** Midnight agenda notification — DESIGN.md §10. */
export async function scheduleMidnightAgenda(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  await setupChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'The Order Paper is laid', body: 'Today’s statutory instruments are before the House.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 0, minute: 0, channelId: 'default' },
  });
}
