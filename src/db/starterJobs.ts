import { Job } from "../models/Job";

export const starterJobs: Job[] = [
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
