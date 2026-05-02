import { dbPromise } from "../db/sqlite.native";
import { starterJobs } from "../db/starterJobs";
import { Job } from "../models/Job";

// addJob/addJobs should be an offline second operation (jobs shouldnt be added whilst offline but added FROM firestore once connectivity is restored)
export async function addJob(job: Job) {
  const db = await dbPromise;
  await db.runAsync(
    `INSERT INTO jobs (id, siteName, assetName, dueDate, status) VALUES (?, ?, ?, ?, ?)`,
    job.id,
    job.siteName,
    job.assetName,
    job.dueDate,
    job.status,
  );
  return { ...job };
}

export async function addJobs(jobs: Job[]) {
  const db = await dbPromise;
  const addedJobs: Job[] = [];
  for (const job of jobs) {
    await db.runAsync(
      `INSERT INTO jobs (id, siteName, assetName, dueDate, status) VALUES (?, ?, ?, ?, ?)`,
      job.id,
      job.siteName,
      job.assetName,
      job.dueDate,
      job.status,
    );
    addedJobs.push({ ...job });
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
