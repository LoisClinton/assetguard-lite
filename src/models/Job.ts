// The Job model represents a work assignment given to a field engineer.
export type Job = {
  id: string;
  siteName: string;
  assetName: string;
  dueDate: string;
  status: "assigned" | "in_progress" | "completed";
};
