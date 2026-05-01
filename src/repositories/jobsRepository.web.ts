import { Job } from "@/src/models/Job";
import { starterJobs } from "../db/starterJobs";

const JOBS_KEY = process.env.JOBS_KEY || "jobs";

export async function addJob(job: Omit<Job, "id">) {
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
  const id = `job-${Date.now()}`;
  const newJob = { ...job, id };
  jobs.push(newJob);
  localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  return newJob;
}

export async function addJobs(jobs: Omit<Job, "id">[]) {
  const addedJobs: Job[] = [];
  for (const job of jobs) {
    const addedJob = await addJob(job);
    addedJobs.push(addedJob);
  }
  return addedJobs;
}

export async function getJobs(): Promise<Job[]> {
  const jobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
  return jobs;
}

export async function getJobById(id: string): Promise<Job | null> {
  const jobs: Job[] = await getJobs();
  const job = jobs.find((job) => job.id === id);
  return job || null;
}

export async function seedJobs() {
  const existingJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || "[]");
  if (existingJobs.length > 0) return;

  await addJobs(starterJobs);
}
