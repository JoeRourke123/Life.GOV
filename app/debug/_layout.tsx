/** Debug stack — pushed from the Settings debug menu. No native headers; screens use GovScreen. */
import { Stack } from 'expo-router';

export default function DebugLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
