import { dbPromise } from "../db/sqlite.native";
import { starterJobs } from "../db/starterJobs";
import { Job } from "../models/Job";

export async function addJob(job: Omit<Job, "id">) {
  const db = await dbPromise;
  const id = `job-${Date.now()}`;
  await db.runAsync(
    `INSERT INTO jobs (id, siteName, assetName, dueDate, status) VALUES (?, ?, ?, ?, ?)`,
    id,
    job.siteName,
    job.assetName,
    job.dueDate,
    job.status,
  );
  return { ...job, id };
}

export async function addJobs(jobs: Omit<Job, "id">[]) {
  const db = await dbPromise;
  const addedJobs: Job[] = [];
  for (const job of jobs) {
    const id = `job-${Date.now()}`;
    await db.runAsync(
      `INSERT INTO jobs (id, siteName, assetName, dueDate, status) VALUES (?, ?, ?, ?, ?)`,
      id,
      job.siteName,
      job.assetName,
      job.dueDate,
      job.status,
    );
    addedJobs.push({ ...job, id });
  }
  return addedJobs;
}

export async function getJobs() {
  const db = await dbPromise;
  const result = (await db.getAllAsync(
    `SELECT * FROM jobs ORDER BY dueDate ASC`,
  )) as Job[];
  return result;
}

export async function getJobById(id: string): Promise<Job | null> {
  const db = await dbPromise;
  const rows = (await db.getAllAsync(
    `SELECT * FROM jobs WHERE id = ?`,
    id,
  )) as Job[];
  return rows.length > 0 ? rows[0] : null;
}

export async function seedJobs() {
  const db = await dbPromise;

  const result = await db.getAllAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM jobs`,
  );

  const count = result[0]?.count ?? 0;

  if (count > 0) return;

  addJobs(starterJobs);
}
