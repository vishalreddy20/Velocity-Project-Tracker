import { useEffect, useMemo, useRef, useState } from 'react';
import type { PresenceUser, Priority, Status, Task, User } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../types';
import { dueLabel } from '../utils/date';
import { groupByStatus } from '../utils/taskSelectors';
import styles from './KanbanView.module.css';

interface KanbanViewProps {
  tasks: Task[];
  users: User[];
  presenceUsers: PresenceUser[];
  presenceByTask: Record<string, PresenceUser[]>;
  onStatusChange: (taskId: string, status: Status) => void;
}

interface DragState {
  taskId: string;
  originStatus: Status;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  overStatus: Status | null;
  snappingBack: boolean;
  originRect: DOMRect;
}

interface MotionAvatar {
  id: string;
  initials: string;
  color: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  phase: 'start' | 'move';
}

const PRIORITY_TONES: Record<Priority, string> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};

export const KanbanView = ({
  tasks,
  users,
  presenceUsers,
  presenceByTask,
  onStatusChange,
}: KanbanViewProps) => {
  const grouped = useMemo(() => groupByStatus(tasks), [tasks]);
  const userMap = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const prevPresenceRef = useRef<Record<string, string>>({});
  const [drag, setDrag] = useState<DragState | null>(null);
  const [movingAvatars, setMovingAvatars] = useState<MotionAvatar[]>([]);

  const presenceIndexMap = useMemo(() => {
    return presenceUsers.reduce<Record<string, number>>((acc, user) => {
      const usersOnCard = presenceByTask[user.currentTaskId] ?? [];
      acc[user.id] = usersOnCard.findIndex((item) => item.id === user.id);
      return acc;
    }, {});
  }, [presenceByTask, presenceUsers]);

  const getPresenceAnchor = (taskId: string, index: number): { x: number; y: number } | null => {
    const card = cardRefs.current[taskId];
    if (!card) return null;

    const rect = card.getBoundingClientRect();
    const stackOffset = index > 0 ? Math.min(index, 2) * 8 : 0;
    return {
      x: rect.left + rect.width - 24 - stackOffset,
      y: rect.top + rect.height - 20,
    };
  };

  useEffect(() => {
    const previous = prevPresenceRef.current;
    const nextMap = presenceUsers.reduce<Record<string, string>>((acc, user) => {
      acc[user.id] = user.currentTaskId;
      return acc;
    }, {});

    const newMotions: MotionAvatar[] = [];

    presenceUsers.forEach((user) => {
      const prevTaskId = previous[user.id];
      if (!prevTaskId || prevTaskId === user.currentTaskId) {
        return;
      }

      const from = getPresenceAnchor(prevTaskId, 0);
      const to = getPresenceAnchor(user.currentTaskId, presenceIndexMap[user.id] ?? 0);
      if (!from || !to) {
        return;
      }

      newMotions.push({
        id: `${user.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        initials: user.initials,
        color: user.color,
        fromX: from.x,
        fromY: from.y,
        toX: to.x,
        toY: to.y,
        phase: 'start',
      });
    });

    prevPresenceRef.current = nextMap;

    if (newMotions.length === 0) {
      return;
    }

    setMovingAvatars((prev) => [...prev, ...newMotions]);

    window.requestAnimationFrame(() => {
      setMovingAvatars((prev) =>
        prev.map((item) =>
          newMotions.some((motion) => motion.id === item.id)
            ? { ...item, phase: 'move' }
            : item,
        ),
      );
    });

    window.setTimeout(() => {
      setMovingAvatars((prev) =>
        prev.filter((item) => !newMotions.some((motion) => motion.id === item.id)),
      );
    }, 520);
  }, [presenceIndexMap, presenceUsers]);

  const startDrag = (task: Task, event: React.PointerEvent<HTMLElement>) => {
    if (typeof event.button === 'number' && event.button !== 0) return;

    const card = cardRefs.current[task.id];
    if (!card) return;

    const rect = card.getBoundingClientRect();

    const nextDrag: DragState = {
      taskId: task.id,
      originStatus: task.status,
      x: rect.left,
      y: rect.top,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      width: rect.width,
      height: rect.height,
      overStatus: task.status,
      snappingBack: false,
      originRect: rect,
    };

    setDrag(nextDrag);

    const onMove = (moveEvent: PointerEvent) => {
      setDrag((prev) => {
        if (!prev) return prev;

        const hovered = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
        const zone = hovered?.closest('[data-dropzone]') as HTMLElement | null;
        const overStatus = (zone?.dataset.dropzone as Status | undefined) ?? null;

        return {
          ...prev,
          x: moveEvent.clientX - prev.offsetX,
          y: moveEvent.clientY - prev.offsetY,
          overStatus,
        };
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);

      setDrag((prev) => {
        if (!prev) return null;

        if (prev.overStatus) {
          onStatusChange(prev.taskId, prev.overStatus);
          return null;
        }

        const snapState = {
          ...prev,
          x: prev.originRect.left,
          y: prev.originRect.top,
          snappingBack: true,
        };

        window.setTimeout(() => setDrag(null), 180);
        return snapState;
      });
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const statuses = Object.keys(STATUS_LABELS) as Status[];
  const draggedTask = drag ? tasks.find((task) => task.id === drag.taskId) ?? null : null;
  const draggedDue = draggedTask ? dueLabel(draggedTask.dueDate) : null;

  return (
    <section className={styles.board}>
      {statuses.map((status) => {
        const columnTasks = grouped[status];
        const isOver = drag?.overStatus === status;

        return (
          <div key={status} className={styles.columnWrap}>
            <header className={styles.columnHeader}>
              <h3>{STATUS_LABELS[status]}</h3>
              <span className={styles.count}>{columnTasks.length}</span>
            </header>

            <div
              className={`${styles.column} ${isOver ? styles.columnHover : ''}`}
              data-dropzone={status}
            >
              {columnTasks.length === 0 ? (
                <div className={styles.emptyColumn}>No tasks here yet.</div>
              ) : null}

              {columnTasks.map((task) => {
                if (drag?.taskId === task.id && drag.originStatus === status) {
                  return (
                    <div
                      key={`placeholder-${task.id}`}
                      className={styles.placeholder}
                      style={{ height: drag.height }}
                    />
                  );
                }

                const assignee = userMap.get(task.assigneeId);
                const due = dueLabel(task.dueDate);
                const collaborators = presenceByTask[task.id] ?? [];
                const shown = collaborators.slice(0, 2);
                const extra = collaborators.length - shown.length;

                return (
                  <article
                    key={task.id}
                    ref={(node) => {
                      cardRefs.current[task.id] = node;
                    }}
                    className={styles.card}
                    onPointerDown={(event) => startDrag(task, event)}
                  >
                    <div className={styles.cardTop}>
                      <h4>{task.title}</h4>
                      <span className={`${styles.priority} ${styles[PRIORITY_TONES[task.priority]]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>

                    <div className={styles.cardMeta}>
                      <span className={styles.assignee} style={{ backgroundColor: assignee?.color ?? '#475569' }}>
                        {assignee?.initials ?? 'NA'}
                      </span>
                      <span className={due.tone === 'danger' ? styles.dueDanger : due.tone === 'warning' ? styles.dueWarn : ''}>
                        {due.label}
                      </span>
                    </div>

                    {collaborators.length > 0 ? (
                      <div className={styles.presenceStack}>
                        {shown.map((presence) => (
                          <span
                            key={presence.id}
                            className={styles.presenceAvatar}
                            style={{ backgroundColor: presence.color }}
                            title={`${presence.name} is ${presence.mode}`}
                          >
                            {presence.initials}
                          </span>
                        ))}
                        {extra > 0 ? <span className={styles.presenceMore}>+{extra}</span> : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </div>
        );
      })}

      {movingAvatars.map((avatar) => (
        <span
          key={avatar.id}
          className={styles.movingAvatar}
          style={{
            backgroundColor: avatar.color,
            left: avatar.phase === 'start' ? avatar.fromX : avatar.toX,
            top: avatar.phase === 'start' ? avatar.fromY : avatar.toY,
          }}
        >
          {avatar.initials}
        </span>
      ))}

      {drag && draggedTask ? (
        <article
          className={styles.dragGhost}
          style={{
            left: drag.x,
            top: drag.y,
            width: drag.width,
            minHeight: drag.height,
            transition: drag.snappingBack ? 'all 180ms ease' : 'none',
          }}
        >
          <div className={styles.cardTop}>
            <h4>{draggedTask.title}</h4>
            <span className={`${styles.priority} ${styles[PRIORITY_TONES[draggedTask.priority]]}`}>
              {PRIORITY_LABELS[draggedTask.priority]}
            </span>
          </div>
          <div className={styles.cardMeta}>
            <span
              className={styles.assignee}
              style={{ backgroundColor: userMap.get(draggedTask.assigneeId)?.color ?? '#475569' }}
            >
              {userMap.get(draggedTask.assigneeId)?.initials ?? 'NA'}
            </span>
            <span
              className={
                draggedDue?.tone === 'danger'
                  ? styles.dueDanger
                  : draggedDue?.tone === 'warning'
                    ? styles.dueWarn
                    : ''
              }
            >
              {draggedDue?.label}
            </span>
          </div>
        </article>
      ) : null}
    </section>
  );
};
