export interface Incident {
  Id: number;
  INC_Number: string;
  Title: string;
  Category: { Value: string };
  Priority: { Value: string };
  State: { Value: string };
  Description: string;
  CallerID: { Title: string; EMail: string } | null;
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
  RequestType: { Value: string };
  Priority: { Value: string };
  State: { Value: string };
  Description: string;
  RequestedBy: { Title: string; EMail: string } | null;
  AssignedTo: { Title: string; EMail: string } | null;
  ApprovalStatus: { Value: string };
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