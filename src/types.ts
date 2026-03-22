export type Status = 'todo' | 'in-progress' | 'in-review' | 'done';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  priority: Priority;
  status: Status;
  startDate: string | null;
  dueDate: string;
  order: number;
}

export interface Filters {
  statuses: Status[];
  priorities: Priority[];
  assignees: string[];
  dueFrom: string;
  dueTo: string;
}

export type SortColumn = 'title' | 'priority' | 'dueDate';

export interface SortState {
  column: SortColumn;
  direction: 'asc' | 'desc';
}

export interface PresenceUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  currentTaskId: string;
  mode: 'viewing' | 'editing';
}

export const STATUS_LABELS: Record<Status, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  done: 'Done',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
