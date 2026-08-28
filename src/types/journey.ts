export type JourneyCategory = 
  | 'feature' 
  | 'bugfix' 
  | 'refactor' 
  | 'review' 
  | 'meeting' 
  | 'docs' 
  | 'testing' 
  | 'other';

export type MRStatus = 'draft' | 'in_review' | 'merged' | 'closed';

export interface UserProfile {
  name: string;
  nik: string;
  role: string;
  level: string;
  position: string;
  employeeStatus: string;
  division: string;
  department: string;
  services: string;
  defaultStartTime: string;
  defaultEndTime: string;
  officeLocation: string;
  defaultPlace: 'OFFICE' | 'WFH';
}

export interface JourneyItem {
  id: string;
  date: string; // YYYY-MM-DD
  jiraKey?: string; // e.g. "MAP-102"
  title: string;
  category: JourneyCategory;
  mrUrl?: string;
  mrTitle?: string;
  mrStatus?: MRStatus;
  branchName?: string;
  repoName?: string;
  notes?: string;
  timeSpent?: string;
  durationMinutes?: number;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface JourneyDatabase {
  version: string;
  profile?: UserProfile;
  items: JourneyItem[];
}

export interface GitInfo {
  branch?: string;
  remoteUrl?: string;
  repoName?: string;
}

export type WebviewMessage =
  | { type: 'INIT_DATA'; payload: { items: JourneyItem[]; profile?: UserProfile; gitInfo?: GitInfo } }
  | { type: 'PROFILE_UPDATED'; payload: UserProfile }
  | { type: 'ITEM_ADDED'; payload: JourneyItem }
  | { type: 'ITEM_UPDATED'; payload: JourneyItem }
  | { type: 'ITEM_DELETED'; payload: { id: string } }
  | { type: 'GIT_INFO'; payload: GitInfo }
  | { type: 'SHOW_NOTIFICATION'; payload: { message: string; level?: 'info' | 'warn' | 'error' } }
  | { type: 'TRIGGER_NEW_ENTRY' }
  | { type: 'TRIGGER_EXPORT_STANDUP' };

export type ExtensionMessage =
  | { command: 'READY' }
  | { command: 'SAVE_PROFILE'; payload: UserProfile }
  | { command: 'ADD_ITEM'; payload: Omit<JourneyItem, 'id' | 'createdAt' | 'updatedAt'> }
  | { command: 'UPDATE_ITEM'; payload: JourneyItem }
  | { command: 'DELETE_ITEM'; payload: { id: string } }
  | { command: 'FETCH_DATA' }
  | { command: 'GET_GIT_INFO' }
  | { command: 'OPEN_EXTERNAL_URL'; payload: { url: string } }
  | { command: 'COPY_TO_CLIPBOARD'; payload: { text: string; label?: string } }
  | { command: 'EXPORT_EXCEL'; payload?: { items?: JourneyItem[]; profile?: UserProfile; selectedMonth?: string } }
  | { command: 'SHOW_MESSAGE'; payload: { message: string; level?: 'info' | 'warn' | 'error' } };
