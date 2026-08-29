export interface Incident {
  Id: number;
  INC_Number: string;
  Title: string;
  Category:   { Value: string } | string | null;
  Priority:   { Value: string } | string | null;
  State:      { Value: string } | string | null;
  Description: string;
  CallerID:   { Title: string; EMail: string } | null;
  AssignedTo: { Title: string; EMail: string } | null;
  AssignmentGroup: string;
  Resolution: string;
  ResolvedDate: string | null;
  Created: string;
  Modified: string;
}

export interface Request {
  Id: number;
  REQ_Number: string;
  Title: string;
  RequestType:    { Value: string } | string | null;
  Priority:       { Value: string } | string | null;
  State:          { Value: string } | string | null;
  Description: string;
  RequestedBy: { Title: string; EMail: string } | null;
  AssignedTo:  { Title: string; EMail: string } | null;
  ApprovalStatus: { Value: string } | string | null;
  DueDate: string | null;
  CompletionNotes: string;
  Created: string;
}

export interface WorkNote {
  Id: number;
  Title: string;
  RecordNumber: string;
  Note: string;
  AddedBy: { Title: string } | null;
  Created: string;
}

// Helper — safely gets Value from Choice field
export function getVal(
  field: { Value: string } | string | null | undefined
): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  return field.Value ?? "";
}