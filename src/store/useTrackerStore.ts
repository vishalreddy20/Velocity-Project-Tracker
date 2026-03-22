import { create } from 'zustand';
import { generateTasks, seedUsers } from '../data/generateTasks';
import type { Filters, PresenceUser, SortState, Status, Task, ViewMode } from '../types';

interface TrackerState {
  tasks: Task[];
  users: typeof seedUsers;
  view: ViewMode;
  filters: Filters;
  sortState: SortState;
  presenceUsers: PresenceUser[];
  setView: (view: ViewMode) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  setSortState: (column: SortState['column']) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  setPresenceUsers: (presenceUsers: PresenceUser[]) => void;
}

const defaultFilters: Filters = {
  statuses: [],
  priorities: [],
  assignees: [],
  dueFrom: '',
  dueTo: '',
};

export const useTrackerStore = create<TrackerState>((set) => ({
  tasks: generateTasks(),
  users: seedUsers,
  view: 'kanban',
  filters: defaultFilters,
  sortState: { column: 'dueDate', direction: 'asc' },
  presenceUsers: [],

  setView: (view) => set({ view }),

  setFilters: (patch) =>
    set((state) => ({
      filters: {
        ...state.filters,
        ...patch,
      },
    })),

  clearFilters: () => set({ filters: defaultFilters }),

  setSortState: (column) =>
    set((state) => {
      if (state.sortState.column === column) {
        return {
          sortState: {
            column,
            direction: state.sortState.direction === 'asc' ? 'desc' : 'asc',
          },
        };
      }

      return {
        sortState: {
          column,
          direction: 'asc',
        },
      };
    }),

  updateTaskStatus: (taskId, status) =>
    set((state) => {
      const maxOrder = Math.max(
        0,
        ...state.tasks.filter((task) => task.status === status).map((task) => task.order),
      );

      return {
        tasks: state.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status,
                order: maxOrder + 1,
              }
            : task,
        ),
      };
    }),

  setPresenceUsers: (presenceUsers) => set({ presenceUsers }),
}));
