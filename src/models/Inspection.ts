// The inspection model that represents one inspection to be completed by a field engineer as part of a Job.
export type Inspection = {
  id: string;
  jobId: string;
  notes: string;
  status: "draft" | "complete";
  updatedAt: string;
  completedAt?: string;
};
