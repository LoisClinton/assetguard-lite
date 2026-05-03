import { dbPromise } from "../db/sqlite.native";
import { Inspection } from "../models/Inspection";
import { saveInspectionQueueItem } from "./queueRepository.native";

export async function saveInspection(record: Inspection) {
  const db = await dbPromise;

  console.log("💾 Saving inspection:", record);

  await db.runAsync(
    `INSERT OR REPLACE INTO inspections (id, jobId, notes, status, updatedAt) 
		VALUES (?, ?, ?, ?, ?)`,
    record.id,
    record.jobId,
    record.notes,
    record.status,
    record.updatedAt,
  );
  saveInspectionQueueItem(record, "create");
}

export async function updateInspection(record: Inspection) {
  const db = await dbPromise;

  console.log("✏️ Updating inspection:", record);

  await db.runAsync(
    `UPDATE inspections SET notes = ?, status = ?, updatedAt = ? WHERE id = ?`,
    record.notes,
    record.status,
    record.updatedAt,
    record.id,
  );
  saveInspectionQueueItem(record, "update");
}

export async function getInspectionById(id: string) {
  const db = await dbPromise;
  const result = await db.getAllAsync(
    `SELECT * FROM inspections WHERE id = ?`,
    id,
  );
  return result.length > 0 ? result[0] : null;
}

export async function markInspectionComplete(id: string) {
  const db = await dbPromise;
  await db.runAsync(
    `UPDATE inspections SET status = 'complete' WHERE id = ?`,
    id,
  );
}
