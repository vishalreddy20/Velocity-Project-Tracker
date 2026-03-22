import { useMemo } from 'react';
import type { Priority, Task } from '../types';
import { toDateOnly } from '../utils/date';
import styles from './TimelineView.module.css';

interface TimelineViewProps {
  tasks: Task[];
}

const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const DAY_WIDTH = 36;

export const TimelineView = ({ tasks }: TimelineViewProps) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const dayCount = monthEnd.getDate();

  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  // Only show today line if today is in the current month
  const todayIndex = now.getFullYear() === monthStart.getFullYear() && now.getMonth() === monthStart.getMonth() ? now.getDate() - 1 : -1;

  return (
    <section className={styles.container}>
      <div className={styles.scrollArea}>
        <div className={styles.timeline} style={{ minWidth: dayCount * DAY_WIDTH + 260 }}>
          <div className={styles.headerRow}>
            <div className={styles.taskColumn}>Task</div>
            <div className={styles.dayGrid}>
              {days.map((day) => (
                <div key={day} className={styles.dayCell} style={{ width: DAY_WIDTH }}>
                  {day}
                </div>
              ))}
              {todayIndex >= 0 ? (
                <div className={styles.todayLine} style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 }} />
              ) : null}
            </div>
          </div>

          {tasks.map((task) => {
            const due = toDateOnly(task.dueDate);
            const start = task.startDate ? toDateOnly(task.startDate) : due;

            const startIndex = Math.max(0, Math.min(dayCount - 1, start.getDate() - 1));
            const dueIndex = Math.max(0, Math.min(dayCount - 1, due.getDate() - 1));
            const left = Math.min(startIndex, dueIndex) * DAY_WIDTH;
            const width = Math.max(8, (Math.abs(dueIndex - startIndex) + 1) * DAY_WIDTH - 6);

            return (
              <div key={task.id} className={styles.row}>
                <div className={styles.taskColumn}>{task.title}</div>
                <div className={styles.dayGrid}>
                  {task.startDate ? (
                    <div
                      className={styles.bar}
                      style={{
                        left,
                        width,
                        backgroundColor: PRIORITY_COLORS[task.priority],
                      }}
                    />
                  ) : (
                    <div
                      className={styles.marker}
                      style={{
                        left: dueIndex * DAY_WIDTH + DAY_WIDTH / 2,
                        borderColor: PRIORITY_COLORS[task.priority],
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
