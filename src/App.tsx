import { useMemo } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { TimelineView } from './components/TimelineView';
import { usePresenceSimulation } from './hooks/usePresenceSimulation';
import { useUrlFilters } from './hooks/useUrlFilters';
import { useTrackerStore } from './store/useTrackerStore';
import { applyFilters, isFiltersActive, sortTasks } from './utils/taskSelectors';
import type { ViewMode } from './types';
import styles from './App.module.css';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'list', label: 'List' },
  { value: 'timeline', label: 'Timeline' },
];

function App() {
  const tasks = useTrackerStore((state) => state.tasks);
  const users = useTrackerStore((state) => state.users);
  const view = useTrackerStore((state) => state.view);
  const filters = useTrackerStore((state) => state.filters);
  const sortState = useTrackerStore((state) => state.sortState);
  const presenceUsers = useTrackerStore((state) => state.presenceUsers);

  const setView = useTrackerStore((state) => state.setView);
  const setFilters = useTrackerStore((state) => state.setFilters);
  const clearFilters = useTrackerStore((state) => state.clearFilters);
  const setSortState = useTrackerStore((state) => state.setSortState);
  const updateTaskStatus = useTrackerStore((state) => state.updateTaskStatus);

  useUrlFilters();
  usePresenceSimulation(tasks.map((task) => task.id));

  const filteredTasks = useMemo(() => applyFilters(tasks, filters), [filters, tasks]);
  const sortedTasks = useMemo(() => sortTasks(filteredTasks, sortState), [filteredTasks, sortState]);

  const hasFilters = isFiltersActive(filters);

  const presenceByTask = useMemo(() => {
    return presenceUsers.reduce<Record<string, typeof presenceUsers>>((acc, user) => {
      const existing = acc[user.currentTaskId] ?? [];
      acc[user.currentTaskId] = [...existing, user];
      return acc;
    }, {});
  }, [presenceUsers]);

  const editingCount = presenceUsers.filter((user) => user.mode === 'editing').length;

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <header className={styles.topBar}>
          <div>
            <h1>Velocity Project Tracker</h1>
            <p>Multi-view tracker with custom drag-and-drop, virtualization, and collaboration simulation.</p>
          </div>

          <div className={styles.presencePanel}>
            <div className={styles.avatarRow}>
              {presenceUsers.map((user) => (
                <span key={user.id} className={styles.avatar} style={{ backgroundColor: user.color }}>
                  {user.initials}
                </span>
              ))}
            </div>
            <span>
              {presenceUsers.length} people are viewing this board, {editingCount} actively editing
            </span>
          </div>
        </header>

        <FilterBar
          filters={filters}
          users={users}
          onFiltersChange={setFilters}
          onClear={clearFilters}
          showClear={hasFilters}
        />

        <div className={styles.viewSwitcher}>
          {VIEW_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`${styles.viewButton} ${view === option.value ? styles.viewButtonActive : ''}`}
              onClick={() => setView(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {view === 'kanban' ? (
          <KanbanView
            tasks={filteredTasks}
            users={users}
            presenceUsers={presenceUsers}
            presenceByTask={presenceByTask}
            onStatusChange={updateTaskStatus}
          />
        ) : null}

        {view === 'list' ? (
          <ListView
            tasks={sortedTasks}
            sortState={sortState}
            onSort={setSortState}
            onStatusChange={updateTaskStatus}
            onClearFilters={clearFilters}
          />
        ) : null}

        {view === 'timeline' ? <TimelineView tasks={sortedTasks} /> : null}
      </div>
    </ErrorBoundary>
  );
}

export default App;
