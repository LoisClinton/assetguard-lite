import { initDatabase } from "../db/schema.native";
import { Job } from "../models/Job";
import {
  getJobById,
  getJobs,
  seedJobs,
} from "../repositories/jobsRepository.native";

describe("Native: Seeding Starter Jobs", () => {
  beforeEach(async () => {
    await initDatabase();
  });

  describe("seedJobs/addJobs", () => {
    it("should seed starter jobs when table is empty", async () => {
      await seedJobs();
      const jobs = await getJobs();

      expect(jobs).toHaveLength(3);
    });

    it("should not reseed if jobs already exist", async () => {
      await seedJobs();
      const jobsAfterFirstSeed = await getJobs();

      // Seed again
      await seedJobs();
      const jobsAfterSecondSeed = await getJobs();

      expect(jobsAfterFirstSeed).toHaveLength(3);
      expect(jobsAfterSecondSeed).toHaveLength(3);
      expect(jobsAfterFirstSeed).toEqual(jobsAfterSecondSeed);
    });

    it("should seed with correct starter job data", async () => {
      await seedJobs();
      const jobs = await getJobs();

      const expectedJobs: Job[] = [
        {
          id: "job-1",
          siteName: "North Substation",
          assetName: "Transformer A",
          dueDate: "2026-04-30",
          status: "assigned",
        },
        {
          id: "job-2",
          siteName: "East Depot",
          assetName: "Circuit Breaker B",
          dueDate: "2026-05-02",
          status: "assigned",
        },
        {
          id: "job-3",
          siteName: "Western Relay Site",
          assetName: "Backup Generator C",
          dueDate: "2026-05-04",
          status: "assigned",
        },
      ];

      expect(jobs).toEqual(expectedJobs);
    });

    it("should order seeded jobs by dueDate ascending", async () => {
      await seedJobs();
      const jobs = await getJobs();

      expect(jobs[0].dueDate).toBe("2026-04-30");
      expect(jobs[1].dueDate).toBe("2026-05-02");
      expect(jobs[2].dueDate).toBe("2026-05-04");
    });

    it("should seed jobs with 'assigned' status", async () => {
      await seedJobs();
      const jobs = await getJobs();

      jobs.forEach((job) => {
        expect(job.status).toBe("assigned");
      });
    });

    it("should have unique job ids", async () => {
      await seedJobs();
      const jobs = await getJobs();
      const ids = jobs.map((job) => job.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(jobs.length);
    });
  });

  describe("getJobs", () => {
    describe("after seeding", () => {
      beforeEach(async () => {
        await seedJobs();
      });

      it("should return all seeded jobs with correct data", async () => {
        const jobs = await getJobs();

        expect(jobs).toHaveLength(3);
        expect(jobs[0].id).toBe("job-1");
        expect(jobs[1].id).toBe("job-2");
        expect(jobs[2].id).toBe("job-3");

        jobs.forEach((job) => {
          expect(job).toHaveProperty("id");
          expect(job).toHaveProperty("siteName");
          expect(job).toHaveProperty("assetName");
          expect(job).toHaveProperty("dueDate");
          expect(job).toHaveProperty("status");
        });
      });

      it("should return jobs in consistent order", async () => {
        const firstQuery = await getJobs();
        const secondQuery = await getJobs();

        expect(firstQuery).toEqual(secondQuery);
      });
    });
  });

  describe("getJobById after seeding", () => {
    beforeEach(async () => {
      await seedJobs();
    });

    it("should retrieve job-1 by id", async () => {
      const job = await getJobById("job-1");

      expect(job).not.toBeNull();
      expect(job?.id).toBe("job-1");
      expect(job?.siteName).toBe("North Substation");
      expect(job?.assetName).toBe("Transformer A");
    });

    it("should retrieve job-2 by id", async () => {
      const job = await getJobById("job-2");

      expect(job).not.toBeNull();
      expect(job?.id).toBe("job-2");
      expect(job?.siteName).toBe("East Depot");
      expect(job?.assetName).toBe("Circuit Breaker B");
    });

    it("should retrieve job-3 by id", async () => {
      const job = await getJobById("job-3");

      expect(job).not.toBeNull();
      expect(job?.id).toBe("job-3");
      expect(job?.siteName).toBe("Western Relay Site");
      expect(job?.assetName).toBe("Backup Generator C");
    });

    it("should return null for non-existent job id", async () => {
      const job = await getJobById("nonexistent-job");

      expect(job).toBeNull();
    });

    it("should return complete job data for seeded jobs", async () => {
      const job = await getJobById("job-1");

      expect(job).toEqual({
        id: "job-1",
        siteName: "North Substation",
        assetName: "Transformer A",
        dueDate: "2026-04-30",
        status: "assigned",
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle multiple seedJobs calls idempotently", async () => {
      await seedJobs();
      await seedJobs();
      await seedJobs();

      const jobs = await getJobs();
      expect(jobs).toHaveLength(3);
    });

    it("should return null for getJobById before seeding", async () => {
      const db = await dbPromise;
      await db.execAsync("DROP TABLE IF EXISTS jobs");
      await initJobsTable();

      const job = await getJobById("job-1");
      expect(job).toBeNull();
    });

    it("should ensure all seeded jobs are retrievable by id", async () => {
      await seedJobs();
      const jobs = await getJobs();

      for (const job of jobs) {
        const retrieved = await getJobById(job.id);
        expect(retrieved).toEqual(job);
      }
    });
  });
});
