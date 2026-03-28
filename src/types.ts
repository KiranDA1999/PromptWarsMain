export interface BridgeOutput {
  intent: string;
  urgency: 'Low' | 'Medium' | 'High';
  summary: string;
  actions: string[];
  entities: string[];
  sources?: { title: string; uri: string }[];
}

export interface HistoryItem {
  id: string;
  input: string;
  output: BridgeOutput;
  timestamp: number;
  uid: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
