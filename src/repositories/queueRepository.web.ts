import { Inspection } from "../models/Inspection";
import { Job } from "../models/Job";
const INSPECTION_KEY = "assetguard_inspections";
const SYNC_QUEUE_KEY = "assetguard_sync_queue";

export const createInspectionQueueItem = async (inspection: Inspection) => {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const queueItemId = `queue-${Date.now()}`;
  syncQueue.push({
    id: queueItemId,
    entityType: "inspection",
    entityId: inspection.id,
    operation: "create",
    status: "pending",
    retryCount: 0,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
};

export const updateInspectionQueueItem = async (inspection: Inspection) => {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const queueItemId = `queue-${Date.now()}`;
  syncQueue.push({
    id: queueItemId,
    entityType: "inspection",
    entityId: inspection.id,
    operation: "update",
    status: "pending",
    retryCount: 0,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
};

export const createJobQueueItem = async (job: Job) => {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const queueItemId = `queue-${Date.now()}`;
  syncQueue.push({
    id: queueItemId,
    entityType: "job",
    entityId: job.id,
    operation: "create",
    status: "pending",
    retryCount: 0,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
};

export const updateJobQueueItem = async (job: Job) => {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const queueItemId = `queue-${Date.now()}`;
  syncQueue.push({
    id: queueItemId,
    entityType: "job",
    entityId: job.id,
    operation: "update",
    status: "pending",
    retryCount: 0,
    queuedAt: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
};

export async function getPendingQueueItems() {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  return syncQueue.filter((item: any) => item.status === "pending");
}

export async function markQueueItemSynced(id: string) {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const itemIndex = syncQueue.findIndex((item: any) => item.id === id);
  if (itemIndex !== -1) {
    syncQueue[itemIndex].status = "synced";
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
  }
}

export async function markQueueItemFailed(id: string, errorMessage: string) {
  const syncQueue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
  const itemIndex = syncQueue.findIndex((item: any) => item.id === id);
  if (itemIndex !== -1) {
    syncQueue[itemIndex].status = "failed";
    syncQueue[itemIndex].errorMessage = errorMessage;
    syncQueue[itemIndex].retryCount += 1;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
  }
}
