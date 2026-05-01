import { dbPromise } from "./sqlite.native";

export async function initDatabase() {
  const db = await dbPromise;

  await db.execAsync(
    `CREATE TABLE IF NOT EXISTS jobs (
            id TEXT PRIMARY KEY NOT NULL,
            siteName TEXT NOT NULL,
            assetName TEXT NOT NULL,
            dueDate TEXT NOT NULL,
            status TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS inspections (
            id TEXT PRIMARY KEY NOT NULL,
            jobId TEXT NOT NULL,
            notes TEXT NOT NULL,
            status TEXT NOT NULL,
            updatedAt TEXT NOT NULL,
            completedAt TEXT,
            FOREIGN KEY (jobId) REFERENCES jobs(id)
        );

        CREATE TABLE IF NOT EXISTS inspection_items (
            id TEXT PRIMARY KEY NOT NULL,
            inspectionId TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            comment TEXT,
            FOREIGN KEY (inspectionId) REFERENCES inspections(id)
        );

        CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY NOT NULL,
            entityType TEXT NOT NULL,
            entityId TEXT NOT NULL,
            operation TEXT NOT NULL,
            status TEXT NOT NULL,
            errorMessage TEXT,
            retryCount INTEGER NOT NULL,
            queuedAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY NOT NULL,
            entityId TEXT NOT NULL,
            action TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            userId TEXT NOT NULL
        );
  `,
  );
}
