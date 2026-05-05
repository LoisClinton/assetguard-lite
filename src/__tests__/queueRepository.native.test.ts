import { Inspection } from "../models/Inspection";
import { Job } from "../models/Job";

jest.mock("../db/sqlite.native");

describe("queueRepository (native)", () => {
  let mockDb: any;
  let queueRepository: any;
  let mockInspection: Inspection;
  let mockInspectionTwo: Inspection;
  let mockJob: Job;

  beforeEach(() => {
    mockDb = {
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };

    jest.resetModules();
    jest.doMock("../db/sqlite.native", () => ({
      dbPromise: Promise.resolve(mockDb),
    }));

    queueRepository = require("../repositories/queueRepository.native");

    mockInspection = {
      id: "inspection-1",
      jobId: "job-1",
      notes: "Test inspection",
      status: "draft",
      updatedAt: "2026-05-03T10:00:00Z",
    };

    mockInspectionTwo = {
      id: "inspection-2",
      jobId: "job-2",
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
    jest.unmock("../db/sqlite.native");
  });

  describe("saveInspectionQueueItem", () => {
    it("should insert a queue item for creating an inspection", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO sync_queue"),
        expect.any(String),
        "inspection",
        mockInspection.id,
        "create",
        "pending",
        0,
        expect.any(String),
      );
    });

    it("should generate a unique queue item id", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      const firstCall = mockDb.runAsync.mock.calls[0];
      const firstId = firstCall[1];

      await queueRepository.saveInspectionQueueItem(
        mockInspectionTwo,
        "create",
      );
      const secondCall = mockDb.runAsync.mock.calls[1];
      const secondId = secondCall[1];

      expect(firstId).toMatch(/^queue-/);
      expect(secondId).toMatch(/^queue-/);
      expect(firstId).not.toBe(secondId);
    });

    it("should set status to pending", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "inspection",
        expect.any(String),
        "create",
        "pending",
        expect.any(Number),
        expect.any(String),
      );
    });

    it("should insert a queue item for updating an inspection", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO sync_queue"),
        expect.any(String),
        "inspection",
        mockInspection.id,
        "update",
        "pending",
        0,
        expect.any(String),
      );
    });

    it("should mark operation as update", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");

      const call = mockDb.runAsync.mock.calls[0];
      expect(call[4]).toBe("update");
    });
  });

  describe("saveJobQueueItem", () => {
    it("should insert a queue item for creating a job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "create");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO sync_queue"),
        expect.any(String),
        "job",
        mockJob.id,
        "create",
        "pending",
        0,
        expect.any(String),
      );
    });

    it("should set entityType to job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "create");

      const call = mockDb.runAsync.mock.calls[0];
      expect(call[2]).toBe("job");
    });

    it("should insert a queue item for updating a job", async () => {
      await queueRepository.saveJobQueueItem(mockJob, "update");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO sync_queue"),
        expect.any(String),
        "job",
        mockJob.id,
        "update",
        "pending",
        0,
        expect.any(String),
      );
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

      mockDb.getAllAsync.mockResolvedValue(mockQueueItems);

      const result = await queueRepository.getPendingQueueItems();

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining(
          "SELECT * FROM sync_queue WHERE status = 'pending'",
        ),
      );
      expect(result).toEqual(mockQueueItems);
    });

    it("should return empty array when no pending items", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await queueRepository.getPendingQueueItems();

      expect(result).toEqual([]);
    });
  });

  describe("markQueueItemSynced", () => {
    it("should update queue item status to synced", async () => {
      await queueRepository.markQueueItemSynced("queue-1");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE sync_queue SET status = 'synced'"),
        "queue-1",
      );
    });

    it("should handle non-existent queue item gracefully", async () => {
      await queueRepository.markQueueItemSynced("non-existent");

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe("markQueueItemFailed", () => {
    it("should update queue item status to failed", async () => {
      await queueRepository.markQueueItemFailed("queue-1");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE sync_queue SET status = 'failed'"),
        "queue-1",
      );
    });

    it("should handle non-existent queue item gracefully", async () => {
      await queueRepository.markQueueItemFailed("non-existent");

      expect(mockDb.runAsync).toHaveBeenCalled();
    });
  });

  describe("integration scenarios", () => {
    it("should handle mixed inspection and job queue items", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      await queueRepository.saveJobQueueItem(mockJob, "create");
      await queueRepository.saveInspectionQueueItem(mockInspection, "update");
      await queueRepository.saveJobQueueItem(mockJob, "update");

      expect(mockDb.runAsync).toHaveBeenCalledTimes(4);
    });

    it("should track retryCount as 0 for new items", async () => {
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");

      const call = mockDb.runAsync.mock.calls[0];
      const retryCount = call[6];
      expect(retryCount).toBe(0);
    });

    it("should use ISO timestamp for queuedAt", async () => {
      const beforeTime = new Date();
      await queueRepository.saveInspectionQueueItem(mockInspection, "create");
      const afterTime = new Date();

      const call = mockDb.runAsync.mock.calls[0];
      const queuedAt = call[7];

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
