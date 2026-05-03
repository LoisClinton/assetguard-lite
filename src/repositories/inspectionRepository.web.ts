import { Inspection } from "../models/Inspection";
import { saveInspectionQueueItem } from "./queueRepository.web";
const INSPECTION_KEY = "assetguard_inspections";

export function getInspections(): Inspection[] {
  return JSON.parse(localStorage.getItem(INSPECTION_KEY) || "[]");
}

export function getInspectionById(id: string): Inspection | null {
  const inspections = getInspections();
  return (
    [...inspections]
      .reverse()
      .find((existingInspection) => existingInspection.id === id) || null
  );
}

export function saveInspections(inspections: Inspection[]) {
  localStorage.setItem(INSPECTION_KEY, JSON.stringify(inspections));
  for (const inspection of inspections) {
    saveInspectionQueueItem(inspection, "create");
    console.log("💾 Saved inspection:", inspection);
  }
}

export async function saveInspection(inspection: Inspection) {
  const inspections = getInspections().filter(
    (existingInspection) => existingInspection.id !== inspection.id,
  );
  inspections.push(inspection);
  saveInspections(inspections);
}

export async function updateInspection(inspection: Inspection) {
  const inspections = getInspections();
  const inspectionIndex = inspections.findIndex(
    (existingInspection) => existingInspection.id === inspection.id,
  );

  if (inspectionIndex === -1) {
    throw new Error(`Inspection ${inspection.id} not found locally`);
  }

  inspections[inspectionIndex] = inspection;
  saveInspections(inspections);
  saveInspectionQueueItem(inspection, "update");
}

export async function markInspectionComplete(id: string) {
  const inspections = getInspections();
  const inspection = inspections.find(
    (existingInspection) => existingInspection.id === id,
  );
  if (inspection) {
    inspection.status = "complete";
    saveInspections(inspections);
  }
}
