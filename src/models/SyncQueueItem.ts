/* The SyncQueueItem model represents an item in the synchronization queue, 
 which tracks changes to entities (inspection, inspectionItem, job, AuditLog) 
 that need to be synchronized with the remote server. */
export type SyncQueueItem = {
  id: string;
  entityType: "inspection" | "inspectionItem" | "job";
  entityId: string;
  operation: "create" | "update" | "delete";
  status: "pending" | "syncing" | "synced" | "failed";
  errorMessage?: string;
  retryCount: number;
  queuedAt: string;
};
