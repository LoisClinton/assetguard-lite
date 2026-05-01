// The inspection item model it represents one element of the full inspection
export type InspectionItem = {
  id: string;
  inspectionId: string;
  question: string;
  answer: "pass" | "fail";
  comment?: string;
};
