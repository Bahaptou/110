import { type SQLiteDatabase } from 'expo-sqlite';

import { SCHEMA_STATEMENTS } from './schema';

export const DATABASE_NAME = 'app.db';

/** Runs schema creation statements. Safe to call on every app start (uses IF NOT EXISTS). */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await db.execAsync(statement);
    }
  });
}
