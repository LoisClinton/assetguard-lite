import { dbPromise } from "../db/sqlite.native";
import { Inspection } from "../models/Inspection";
import { Job } from "../models/Job";

export async function createInspectionQueueItem(inspection: Inspection) {
  const db = await dbPromise;
  const queueItemId = `queue-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO sync_queue (id, entityType, entityId, operation, status, retryCount, queuedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    queueItemId,
    "inspection",
    inspection.id,
    "create",
    "pending",
    0,
    new Date().toISOString(),
  );
}

export async function updateInspectionQueueItem(inspection: Inspection) {
  const db = await dbPromise;
  const queueItemId = `queue-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO sync_queue (id, entityType, entityId, operation, status, retryCount, queuedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    queueItemId,
    "inspection",
    inspection.id,
    "update",
    "pending",
    0,
    new Date().toISOString(),
  );
}

export async function createJobQueueItem(job: Job) {
  const db = await dbPromise;
  const queueItemId = `queue-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO sync_queue (id, entityType, entityId, operation, status, retryCount, queuedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    queueItemId,
    "job",
    job.id,
    "create",
    "pending",
    0,
    new Date().toISOString(),
  );
}

export async function updateJobQueueItem(job: Job) {
  const db = await dbPromise;
  const queueItemId = `queue-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO sync_queue (id, entityType, entityId, operation, status, retryCount, queuedAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
    queueItemId,
    "job",
    job.id,
    "update",
    "pending",
    0,
    new Date().toISOString(),
  );
}

export async function markQueueItemSynced(id: string) {
  const db = await dbPromise;
  await db.runAsync(`UPDATE sync_queue SET status = 'synced' WHERE id = ?`, id);
}

export async function markQueueItemFailed(id: string) {
  const db = await dbPromise;
  await db.runAsync(`UPDATE sync_queue SET status = 'failed' WHERE id = ?`, id);
}

export async function getPendingQueueItems() {
  const db = await dbPromise;
  const result = await db.getAllAsync(
    `SELECT * FROM sync_queue WHERE status = 'pending'`,
  );
  return result;
}
