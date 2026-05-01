/* The AuditLog model represents a record of actions taken by field engineers (userId) 
on entities (entityId) such as Jobs, Inspections, or InspectionItems, 
along with a timestamp for when the action occurred. */
export type AuditLog = {
  id: string;
  entityId: string;
  action: string;
  timestamp: string;
  userId: string;
};
