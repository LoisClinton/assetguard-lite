import { Inspection } from "../models/Inspection";

describe("inspectionRepository (native)", () => {
  let mockDb: any;
  let inspectionRepository: any;
  let mockInspection: Inspection;

  beforeEach(async () => {
    mockDb = {
      runAsync: jest.fn().mockResolvedValue(undefined),
      getAllAsync: jest.fn().mockResolvedValue([]),
    };

    jest.resetModules();
    jest.doMock("../db/sqlite.native", () => ({
      dbPromise: Promise.resolve(mockDb),
    }));

    inspectionRepository = require("../repositories/inspectionRepository.native");

    mockInspection = {
      id: "inspection-1",
      jobId: "job-1",
      notes: "Initial inspection notes",
      status: "draft",
      updatedAt: "2026-05-02T10:00:00Z",
    };
  });

  afterEach(() => {
    jest.unmock("../db/sqlite.native");
  });

  describe("saveInspection", () => {
    it("should insert a new inspection into the database", async () => {
      await inspectionRepository.saveInspection(mockInspection);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("INSERT OR REPLACE INTO inspections"),
        mockInspection.id,
        mockInspection.jobId,
        mockInspection.notes,
        mockInspection.status,
        mockInspection.updatedAt,
      );
    });

    it("should log the save operation", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await inspectionRepository.saveInspection(mockInspection);

      expect(consoleSpy).toHaveBeenCalledWith(
        "💾 Saving inspection:",
        mockInspection,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("updateInspection", () => {
    it("should update an existing inspection", async () => {
      const updatedInspection = {
        ...mockInspection,
        notes: "Updated notes",
        status: "complete" as const,
      };

      await inspectionRepository.updateInspection(updatedInspection);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE inspections SET"),
        updatedInspection.notes,
        updatedInspection.status,
        updatedInspection.updatedAt,
        updatedInspection.id,
      );
    });

    it("should log the update operation", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      await inspectionRepository.updateInspection(mockInspection);

      expect(consoleSpy).toHaveBeenCalledWith(
        "✏️ Updating inspection:",
        mockInspection,
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getInspectionById", () => {
    it("should return an inspection when found", async () => {
      mockDb.getAllAsync.mockResolvedValue([mockInspection]);

      const result =
        await inspectionRepository.getInspectionById("inspection-1");

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM inspections WHERE id = ?"),
        "inspection-1",
      );
      expect(result).toEqual(mockInspection);
    });

    it("should return null when inspection not found", async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result =
        await inspectionRepository.getInspectionById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("markInspectionComplete", () => {
    it("should update inspection status to complete", async () => {
      await inspectionRepository.markInspectionComplete("inspection-1");

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE inspections SET status = 'complete'"),
        "inspection-1",
      );
    });
  });
});
