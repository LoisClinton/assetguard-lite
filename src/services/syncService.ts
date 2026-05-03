import { collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { getInspectionById } from "../repositories/inspectionRepository";
import {
  getPendingQueueItems,
  markQueueItemFailed,
  markQueueItemSynced,
} from "../repositories/queueRepository";
import { db } from "./firebase";

export async function syncPendingInspections() {
  console.log("🔄 Starting sync...");

  const pendingQueueItems = await getPendingQueueItems();
  let syncedCount = 0;
  let failedCount = 0;

  for (const item of pendingQueueItems) {
    try {
      console.log(
        `📦 Processing queue item: ${item.id} (inspection: ${item.entityId})`,
      );

      const inspection = await getInspectionById(item.entityId);

      if (!inspection) {
        throw new Error(`Inspection ${item.entityId} not found locally`);
      }

      console.log(`✓ Found inspection locally:`, inspection);

      const docRef = doc(collection(db, "inspections"), inspection.id);
      const dataToSync = {
        ...inspection,
        syncedAt: new Date().toISOString(),
      };

      if (item.operation === "create") {
        console.log(
          `📤 Creating new inspection in Firestore at inspections/${inspection.id}`,
        );
        await setDoc(docRef, dataToSync);
        console.log(`✅ Inspection created in Firestore`);
      } else if (item.operation === "update") {
        console.log(
          `📝 Updating existing inspection in Firestore at inspections/${inspection.id}`,
        );
        await updateDoc(docRef, dataToSync);
        console.log(`✅ Inspection updated in Firestore`);
      } else {
        throw new Error(`Unknown operation: ${item.operation}`);
      }

      await markQueueItemSynced(item.id);

      console.log(`✓ Local record updated as synced`);
      syncedCount++;
    } catch (error) {
      failedCount++;
      console.error(`❌ Failed to sync inspection ${item.entityId}:`, error);
      await markQueueItemFailed(item.id);
    }
  }

  console.log(
    `✅ Sync complete: ${syncedCount} succeeded, ${failedCount} failed`,
  );
}
