/**
 * Local notifications — DESIGN.md §2/§10. expo-notifications scheduled locally:
 * works in Expo Go (no dev build needed for local scheduling). Web: no-op.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SaveState } from './types';

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

/**
 * Recompute all local schedules from state (#22, DESIGN.md §2/§10): midnight agenda,
 * Wednesday 12:00 PMQs, election countdown, low-approval warning. Called after every
 * hydrate and day-cycle reset; cancelling on term end is M5. No-op on web.
 */
export async function syncSchedules(state: SaveState): Promise<void> {
  if (Platform.OS === 'web') return;
  await setupChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  await scheduleMidnightAgenda();

  // PMQs every Wednesday 12:00 (expo weekday: 1 = Sunday … 4 = Wednesday).
  await Notifications.scheduleNotificationAsync({
    content: { title: 'You are called to the despatch box', body: 'PMQs. Wednesday, 12:00. Mind your wording.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 4, hour: 12, minute: 0, channelId: 'default' },
  });

  // Election countdown (DESIGN.md §5).
  if (state.manifesto?.electionDate) {
    const election = new Date(state.manifesto.electionDate);
    const daysLeft = Math.ceil((election.getTime() - Date.now()) / 864e5);
    if (daysLeft > 1) {
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Countdown to polling day', body: `${daysLeft} days until the writ is dropped.` },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 9, minute: 0, channelId: 'default' },
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'The writ is dropped', body: 'Polling day. The ballot is called.' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: election, channelId: 'default' },
    });
  }

  // Low-approval warning, recomputed at each reset.
  if (state.player.approval < 40) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'The lobby is restless', body: `Approval is at ${state.player.approval}. The whips are counting noses.` },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0, channelId: 'default' },
    });
  }
}
