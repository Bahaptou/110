import { type SQLiteDatabase } from 'expo-sqlite';

import { type SettingRow } from '../../db/schema';

/** Raw SQLite access for the `settings` key/value table. No business logic lives here. */

export async function readSetting(db: SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<SettingRow>('SELECT * FROM settings WHERE key = ?;', key);
  return row?.value ?? null;
}

export async function writeSetting(db: SQLiteDatabase, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
    key,
    value
  );
}
