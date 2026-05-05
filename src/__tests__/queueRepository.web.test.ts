import { Inspection } from "../models/Inspection";
import { Job } from "../models/Job";
import * as queueRepository from "../repositories/queueRepository.web";

const SYNC_QUEUE_KEY = "assetguard_sync_queue";

describe("queueRepository (web)", () => {
  let mockInspection: Inspection;
  let mockJob: Job;

  beforeEach(() => {
    localStorage.clear();

    mockInspection = {
      id: "inspection-1",
      jobId: "job-1",
      notes: "Test inspection",
      status: "draft",
      updatedAt: "2026-05-03T10:00:00Z",
    };

    mockJob = {
      id: "job-1",
      siteName: "North Substation",
      assetName: "Transformer A",
      dueDate: "2026-04-30",
      status: "assigned",
    };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("saveInspectionQueueItem", () => {
    it("should add a queue item for creating an inspection", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({
        entityType: "inspection",
        entityId: mockInspection.id,
        operation: "create",
        status: "pending",
        retryCount: 0,
      });
    });

    it("should generate a unique queue item id", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      const firstId = JSON.parse(
        localStorage.getItem(SYNC_QUEUE_KEY) || "[]",
      )[0].id;

      await new Promise((resolve) => setTimeout(resolve, 1));

      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      const secondId = JSON.parse(
        localStorage.getItem(SYNC_QUEUE_KEY) || "[]",
      )[1].id;

      expect(firstId).toMatch(/^queue-/);
      expect(secondId).toMatch(/^queue-/);
      expect(firstId).not.toBe(secondId);
    });

    it("should set status to pending and retryCount to 0", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].status).toBe("pending");
      expect(stored[0].retryCount).toBe(0);
    });

    it("should preserve other queue items when adding", async () => {
      const existingItem = {
        id: "queue-existing",
        entityType: "job",
        entityId: "job-1",
        operation: "create",
        status: "pending",
        retryCount: 0,
        queuedAt: "2026-05-02T10:00:00Z",
      };

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([existingItem]));

      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored).toHaveLength(2);
      expect(stored[0]).toEqual(existingItem);
    });

    it("should add a queue item for updating an inspection", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0]).toMatchObject({
        entityType: "inspection",
        entityId: mockInspection.id,
        operation: "update",
        status: "pending",
      });
    });

    it("should mark operation as update", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].operation).toBe("update");
    });
  });

  describe("saveJobQueueItem", () => {
    it("should add a queue item for creating a job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "create");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0]).toMatchObject({
        entityType: "job",
        entityId: mockJob.id,
        operation: "create",
        status: "pending",
      });
    });

    it("should set entityType to job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "create");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].entityType).toBe("job");
    });

    it("should add a queue item for updating a job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "update");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0]).toMatchObject({
        entityType: "job",
        entityId: mockJob.id,
        operation: "update",
        status: "pending",
      });
    });
  });

  describe("getPendingQueueItems", () => {
    it("should return all pending queue items", async () => {
      const mockQueueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
        {
          id: "queue-2",
          entityType: "job",
          entityId: "job-1",
          operation: "update",
          status: "pending",
          retryCount: 1,
          queuedAt: "2026-05-03T11:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(mockQueueItems));

      const result = await queueRepository.getPendingQueueItems();

      expect(result).toEqual(mockQueueItems);
    });

    it("should filter out non-pending items", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
        {
          id: "queue-2",
          entityType: "job",
          entityId: "job-1",
          operation: "update",
          status: "synced",
          retryCount: 0,
          queuedAt: "2026-05-03T11:00:00Z",
        },
        {
          id: "queue-3",
          entityType: "inspection",
          entityId: "inspection-2",
          operation: "create",
          status: "failed",
          retryCount: 2,
          queuedAt: "2026-05-03T12:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      const result = await queueRepository.getPendingQueueItems();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("queue-1");
    });

    it("should return empty array when no pending items exist", async () => {
      const result = await queueRepository.getPendingQueueItems();

      expect(result).toEqual([]);
    });

    it("should return empty array when storage is empty", async () => {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));

      const result = await queueRepository.getPendingQueueItems();

      expect(result).toEqual([]);
    });
  });

  describe("markQueueItemSynced", () => {
    it("should update queue item status to synced", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      await queueRepository.markQueueItemSynced("queue-1");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].status).toBe("synced");
    });

    it("should not throw error when marking non-existent item", async () => {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));

      await expect(
        queueRepository.markQueueItemSynced("non-existent"),
      ).resolves.not.toThrow();
    });

    it("should preserve other queue items", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
        {
          id: "queue-2",
          entityType: "job",
          entityId: "job-1",
          operation: "update",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T11:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      await queueRepository.markQueueItemSynced("queue-1");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored).toHaveLength(2);
      expect(stored[0].status).toBe("synced");
      expect(stored[1].status).toBe("pending");
    });
  });

  describe("markQueueItemFailed", () => {
    it("should update queue item status to failed", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      await queueRepository.markQueueItemFailed("queue-1", "Network error");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].status).toBe("failed");
    });

    it("should add error message to failed item", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      const errorMsg = "Firebase connection timeout";
      await queueRepository.markQueueItemFailed("queue-1", errorMsg);

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].errorMessage).toBe(errorMsg);
    });

    it("should increment retryCount when marking failed", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 2,
          queuedAt: "2026-05-03T10:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      await queueRepository.markQueueItemFailed("queue-1", "Error");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].retryCount).toBe(3);
    });

    it("should not throw error when marking non-existent item as failed", async () => {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));

      await expect(
        queueRepository.markQueueItemFailed("non-existent", "Error"),
      ).resolves.not.toThrow();
    });

    it("should preserve other queue items when marking one failed", async () => {
      const queueItems = [
        {
          id: "queue-1",
          entityType: "inspection",
          entityId: "inspection-1",
          operation: "create",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T10:00:00Z",
        },
        {
          id: "queue-2",
          entityType: "job",
          entityId: "job-1",
          operation: "update",
          status: "pending",
          retryCount: 0,
          queuedAt: "2026-05-03T11:00:00Z",
        },
      ];

      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queueItems));

      await queueRepository.markQueueItemFailed("queue-1", "Error");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored).toHaveLength(2);
      expect(stored[0].status).toBe("failed");
      expect(stored[1].status).toBe("pending");
    });
  });

  describe("integration scenarios", () => {
    it("should handle mixed inspection and job queue items", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      await queueRepository.saveJobQueueItem(mockJob, "create");
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");
      await queueRepository.saveJobQueueItem(mockJob, "update");

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored).toHaveLength(4);
    });

    it("should track queue item lifecycle: create -> synced", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      let stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      const itemId = stored[0].id;
      expect(stored[0].status).toBe("pending");

      await queueRepository.markQueueItemSynced(itemId);
      stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].status).toBe("synced");
    });

    it("should track queue item lifecycle: create -> failed -> retried", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      let stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      const itemId = stored[0].id;

      await queueRepository.markQueueItemFailed(itemId, "First attempt failed");
      stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].status).toBe("failed");
      expect(stored[0].retryCount).toBe(1);
      expect(stored[0].errorMessage).toBe("First attempt failed");

      await queueRepository.markQueueItemFailed(
        itemId,
        "Second attempt failed",
      );
      stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      expect(stored[0].retryCount).toBe(2);
    });

    it("should use ISO timestamp for queuedAt", async () => {
      const beforeTime = new Date();
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      const afterTime = new Date();

      const stored = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
      const queuedAt = stored[0].queuedAt;

      expect(queuedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(new Date(queuedAt).getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(new Date(queuedAt).getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });
  });
});
