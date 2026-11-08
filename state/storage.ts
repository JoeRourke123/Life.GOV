/**
 * File storage — ADR-0004. The save is an open markdown file (`lifegov/save.md`).
 *
 * Native: `expo-file-system` (new API) in the app documents directory. On iOS the
 * share sheet offers "Save to Files" (iCloud Drive) and the document picker can open
 * files from iCloud Drive — in Expo Go we cannot hold a writable iCloud container
 * (that needs entitlements, i.e. a dev build; ADR-0004 schedules it there).
 * Web: localStorage shim for read/write, DOM download for export.
 */
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

const DIR_NAME = 'lifegov';
const FILE_NAME = 'save.md';
const WEB_KEY = 'lifegov.save.md';

export function saveDir(): Directory {
  return new Directory(Paths.document, DIR_NAME);
}

export function saveFile(): File {
  return new File(saveDir(), FILE_NAME);
}

export async function readSaveText(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(WEB_KEY) ?? null;
    } catch {
      return null;
    }
  }
  const f = saveFile();
  if (!f.exists) return null;
  return f.text();
}

export async function writeSaveText(text: string): Promise<void> {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(WEB_KEY, text);
    return;
  }
  const dir = saveDir();
  if (!dir.exists) dir.create();
  const f = saveFile();
  if (!f.exists) f.create();
  f.write(text);
}

/** Share the save markdown — on iOS the sheet includes "Save to Files" → iCloud Drive. */
export async function exportSaveText(text: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lifegov-save.md';
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
  const f = new File(Paths.cache, 'lifegov-save.md');
  if (!f.exists) f.create();
  f.write(text);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(f.uri, {
    mimeType: 'text/markdown',
    dialogTitle: 'Save to Files (iCloud Drive)',
  });
  return true;
}

/** Pick a save markdown from Files / iCloud Drive. Native only in this PoC. */
export async function importSaveText(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  const res = await DocumentPicker.getDocumentAsync({
    type: ['text/markdown', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled || !res.assets?.length) return null;
  const f = new File(res.assets[0].uri);
  return f.exists ? f.text() : null;
}
