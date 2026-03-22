import type { Filters, Priority, SortState, Status, Task } from '../types';
import { toDateOnly } from './date';

const priorityRank: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export const isFiltersActive = (filters: Filters): boolean =>
  filters.statuses.length > 0 ||
  filters.priorities.length > 0 ||
  filters.assignees.length > 0 ||
  Boolean(filters.dueFrom) ||
  Boolean(filters.dueTo);

export const applyFilters = (tasks: Task[], filters: Filters): Task[] => {
  return tasks.filter((task) => {
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) return false;
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) return false;
    if (filters.assignees.length > 0 && !filters.assignees.includes(task.assigneeId)) return false;

    if (filters.dueFrom) {
      if (toDateOnly(task.dueDate) < toDateOnly(filters.dueFrom)) return false;
    }

    if (filters.dueTo) {
      if (toDateOnly(task.dueDate) > toDateOnly(filters.dueTo)) return false;
    }

    return true;
  });
};

export const sortTasks = (tasks: Task[], sortState: SortState): Task[] => {
  const sorted = [...tasks];
  const modifier = sortState.direction === 'asc' ? 1 : -1;

  sorted.sort((a, b) => {
    if (sortState.column === 'title') {
      return a.title.localeCompare(b.title) * modifier;
    }

    if (sortState.column === 'priority') {
      return (priorityRank[a.priority] - priorityRank[b.priority]) * modifier;
    }

    return (toDateOnly(a.dueDate).getTime() - toDateOnly(b.dueDate).getTime()) * modifier;
  });

  return sorted;
};

export const groupByStatus = (tasks: Task[]): Record<Status, Task[]> => {
  const grouped: Record<Status, Task[]> = {
    todo: [],
    'in-progress': [],
    'in-review': [],
    done: [],
  };

  tasks.forEach((task) => {
    grouped[task.status].push(task);
  });

  (Object.keys(grouped) as Status[]).forEach((status) => {
    grouped[status].sort((a, b) => a.order - b.order);
  });

  return grouped;
};
