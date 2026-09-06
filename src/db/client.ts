import { type SQLiteDatabase } from 'expo-sqlite';

import { MIGRATION_STATEMENTS, SCHEMA_STATEMENTS } from './schema';

export const DATABASE_NAME = 'app.db';

/** Runs schema creation statements. Safe to call on every app start (uses IF NOT EXISTS). */
export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  // SQLite ignores ON DELETE CASCADE unless foreign key enforcement is explicitly turned on per connection.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await db.withTransactionAsync(async () => {
    for (const statement of SCHEMA_STATEMENTS) {
      await db.execAsync(statement);
    }
    for (const statement of MIGRATION_STATEMENTS) {
      try {
        await db.execAsync(statement);
      } catch (cause) {
        // SQLite has no "ADD COLUMN IF NOT EXISTS" — a column already present throws "duplicate column name".
        const message = cause instanceof Error ? cause.message : String(cause);
        if (!/duplicate column name/i.test(message)) {
          throw cause;
        }
      }
    }
  });
}
