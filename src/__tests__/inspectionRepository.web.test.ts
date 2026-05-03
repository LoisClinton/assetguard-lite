import { Inspection } from "../models/Inspection";
import * as inspectionRepository from "../repositories/inspectionRepository.web";

describe("inspectionRepository (web)", () => {
  let mockInspection: Inspection;
  let mockInspections: Inspection[];

  beforeEach(() => {
    mockInspection = {
      id: "inspection-1",
      jobId: "job-1",
      notes: "Initial inspection notes",
      status: "draft",
      updatedAt: "2026-05-02T10:00:00Z",
    };

    mockInspections = [
      mockInspection,
      {
        id: "inspection-2",
        jobId: "job-1",
        notes: "Another inspection",
        status: "complete",
        updatedAt: "2026-05-02T11:00:00Z",
      },
    ];

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("saveInspection", () => {
    it("should save a new inspection to localStorage", async () => {
      await inspectionRepository.saveInspection(mockInspection);

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored).toHaveLength(1);
      expect(stored[0]).toEqual(mockInspection);
    });

    it("should replace an inspection with the same id", async () => {
      await inspectionRepository.saveInspection(mockInspection);

      const updatedInspection = {
        ...mockInspection,
        notes: "Updated notes",
      };

      await inspectionRepository.saveInspection(updatedInspection);

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].notes).toBe("Updated notes");
    });

    it("should preserve other inspections when saving", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify(mockInspections),
      );

      const newInspection = {
        id: "inspection-3",
        jobId: "job-2",
        notes: "New inspection",
        status: "draft" as const,
        updatedAt: "2026-05-02T12:00:00Z",
      };

      await inspectionRepository.saveInspection(newInspection);

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored).toHaveLength(3);
    });
  });

  describe("updateInspection", () => {
    it("should update an existing inspection", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify([mockInspection]),
      );

      const updatedInspection = {
        ...mockInspection,
        notes: "Updated notes",
        status: "complete" as const,
      };

      await inspectionRepository.updateInspection(updatedInspection);

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored[0]).toEqual(updatedInspection);
    });

    it("should throw error when updating non-existent inspection", async () => {
      localStorage.setItem("assetguard_inspections", JSON.stringify([]));

      await expect(
        inspectionRepository.updateInspection(mockInspection),
      ).rejects.toThrow("Inspection inspection-1 not found locally");
    });
  });

  describe("getInspectionById", () => {
    it("should return an inspection when found", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify(mockInspections),
      );

      const result =
        await inspectionRepository.getInspectionById("inspection-1");

      expect(result).toEqual(mockInspection);
    });

    it("should return null when inspection not found", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify(mockInspections),
      );

      const result =
        await inspectionRepository.getInspectionById("non-existent");

      expect(result).toBeNull();
    });

    it("should return the most recent version when duplicates exist", async () => {
      const duplicates = [
        mockInspection,
        {
          ...mockInspection,
          notes: "Newer version",
          updatedAt: "2026-05-02T11:00:00Z",
        },
      ];

      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify(duplicates),
      );

      const result =
        await inspectionRepository.getInspectionById("inspection-1");

      expect(result?.notes).toBe("Newer version");
    });

    it("should return null when storage is empty", async () => {
      const result =
        await inspectionRepository.getInspectionById("inspection-1");

      expect(result).toBeNull();
    });
  });

  describe("markInspectionComplete", () => {
    it("should update inspection status to complete", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify([mockInspection]),
      );

      await inspectionRepository.markInspectionComplete("inspection-1");

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored[0].status).toBe("complete");
    });

    it("should not throw error if inspection not found", async () => {
      localStorage.setItem("assetguard_inspections", JSON.stringify([]));

      await expect(
        inspectionRepository.markInspectionComplete("non-existent"),
      ).resolves.not.toThrow();
    });

    it("should preserve other inspections when marking one complete", async () => {
      localStorage.setItem(
        "assetguard_inspections",
        JSON.stringify(mockInspections),
      );

      await inspectionRepository.markInspectionComplete("inspection-2");

      const stored = JSON.parse(
        localStorage.getItem("assetguard_inspections") || "[]",
      );
      expect(stored).toHaveLength(2);
      expect(stored[1].status).toBe("complete");
      expect(stored[0].status).toBe("draft");
    });
  });
});
