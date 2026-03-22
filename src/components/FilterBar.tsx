import type { Filters, Priority, Status, User } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  filters: Filters;
  users: User[];
  onFiltersChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  showClear: boolean;
}

const toggleValue = <T,>(source: T[], value: T): T[] => {
  if (source.includes(value)) {
    return source.filter((item) => item !== value);
  }
  return [...source, value];
};

export const FilterBar = ({ filters, users, onFiltersChange, onClear, showClear }: FilterBarProps) => {
  const statuses = Object.keys(STATUS_LABELS) as Status[];
  const priorities = Object.keys(PRIORITY_LABELS) as Priority[];

  return (
    <section className={styles.filterBar}>
      <div className={styles.group}>
        <span className={styles.label}>Status</span>
        <div className={styles.pills}>
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              className={`${styles.pill} ${filters.statuses.includes(status) ? styles.pillActive : ''}`}
              onClick={() => onFiltersChange({ statuses: toggleValue(filters.statuses, status) })}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>Priority</span>
        <div className={styles.pills}>
          {priorities.map((priority) => (
            <button
              key={priority}
              type="button"
              className={`${styles.pill} ${filters.priorities.includes(priority) ? styles.pillActive : ''}`}
              onClick={() => onFiltersChange({ priorities: toggleValue(filters.priorities, priority) })}
            >
              {PRIORITY_LABELS[priority]}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <span className={styles.label}>Assignee</span>
        <div className={styles.pills}>
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className={`${styles.pill} ${filters.assignees.includes(user.id) ? styles.pillActive : ''}`}
              onClick={() => onFiltersChange({ assignees: toggleValue(filters.assignees, user.id) })}
            >
              {user.initials}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.dateGroup}>
        <label className={styles.dateLabel} htmlFor="due-from">
          Due from
        </label>
        <input
          id="due-from"
          type="date"
          className={styles.dateInput}
          value={filters.dueFrom}
          onChange={(event) => onFiltersChange({ dueFrom: event.target.value })}
        />
      </div>

      <div className={styles.dateGroup}>
        <label className={styles.dateLabel} htmlFor="due-to">
          Due to
        </label>
        <input
          id="due-to"
          type="date"
          className={styles.dateInput}
          value={filters.dueTo}
          onChange={(event) => onFiltersChange({ dueTo: event.target.value })}
        />
      </div>

      {showClear ? (
        <button type="button" className={styles.clearButton} onClick={onClear}>
          Clear all filters
        </button>
      ) : null}
    </section>
  );
};
