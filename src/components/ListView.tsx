import { useMemo, useRef, useState } from 'react';
import type { SortState, Task } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../types';
import { dueLabel } from '../utils/date';
import styles from './ListView.module.css';

interface ListViewProps {
  tasks: Task[];
  sortState: SortState;
  onSort: (column: SortState['column']) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
  onClearFilters: () => void;
}

const ROW_HEIGHT = 60;
const BUFFER = 5;

export const ListView = ({ tasks, sortState, onSort, onStatusChange, onClearFilters }: ListViewProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(520);

  const totalHeight = tasks.length * ROW_HEIGHT;
  const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER);
  const end = Math.min(
    tasks.length,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + BUFFER,
  );

  const visibleTasks = useMemo(() => tasks.slice(start, end), [end, start, tasks]);

  const onViewportScroll = () => {
    if (!viewportRef.current) return;
    setScrollTop(viewportRef.current.scrollTop);
    setViewportHeight(viewportRef.current.clientHeight);
  };

  if (tasks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h3>No tasks match these filters</h3>
        <p>Try clearing filters to see all tasks again.</p>
        <button type="button" onClick={onClearFilters} className={styles.clearButton}>
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => onSort('title')}
          className={`${styles.headerCell} ${sortState.column === 'title' ? styles.activeSort : ''}`}
        >
          Title {sortState.column === 'title' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          type="button"
          onClick={() => onSort('priority')}
          className={`${styles.headerCell} ${sortState.column === 'priority' ? styles.activeSort : ''}`}
        >
          Priority {sortState.column === 'priority' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <button
          type="button"
          onClick={() => onSort('dueDate')}
          className={`${styles.headerCell} ${sortState.column === 'dueDate' ? styles.activeSort : ''}`}
        >
          Due date {sortState.column === 'dueDate' ? (sortState.direction === 'asc' ? '↑' : '↓') : ''}
        </button>
        <div className={styles.headerCell}>Status</div>
      </div>

      <div className={styles.viewport} ref={viewportRef} onScroll={onViewportScroll}>
        <div className={styles.spacer} style={{ height: totalHeight }}>
          {visibleTasks.map((task, index) => {
            const due = dueLabel(task.dueDate);
            return (
              <div
                key={task.id}
                className={styles.row}
                style={{ top: (start + index) * ROW_HEIGHT, height: ROW_HEIGHT }}
              >
                <div className={styles.cell}>{task.title}</div>
                <div className={styles.cell}>{PRIORITY_LABELS[task.priority]}</div>
                <div className={`${styles.cell} ${due.tone === 'danger' ? styles.danger : ''}`}>{due.label}</div>
                <div className={styles.cell}>
                  <select
                    value={task.status}
                    onChange={(event) => onStatusChange(task.id, event.target.value as Task['status'])}
                    className={styles.select}
                  >
                    {(Object.keys(STATUS_LABELS) as Task['status'][]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className={styles.counter}>{tasks.length} tasks loaded with virtual scrolling.</p>
    </section>
  );
};
