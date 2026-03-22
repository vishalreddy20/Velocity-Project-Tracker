import { useEffect } from 'react';
import { useTrackerStore } from '../store/useTrackerStore';
import type { PresenceUser } from '../types';

interface CollaborationEvent {
  id: string;
  userId: string;
  userName: string;
  action: 'typing' | 'viewing' | 'saved' | 'conflict';
  taskTitle: string;
  timestamp: number;
  duration: number;
}

export const useCollaborationSimulation = (presenceUsers: PresenceUser[]) => {
  useEffect(() => {
    if (presenceUsers.length === 0) return;

    const events: CollaborationEvent[] = [];
    const eventMap = new Map<string, CollaborationEvent>();

    const simulateActivity = () => {
      presenceUsers.forEach((user) => {
        // 40% chance of activity per interval
        if (Math.random() > 0.6) {
          const action = Math.random() > 0.7 ? 'typing' : 'viewing';
          const eventKey = `${user.id}-${user.currentTaskId}`;
          const now = Date.now();

          if (!eventMap.has(eventKey)) {
            const event: CollaborationEvent = {
              id: `${user.id}-${user.currentTaskId}-${now}`,
              userId: user.id,
              userName: user.name,
              action: action as 'typing' | 'viewing',
              taskTitle: `Task #${user.currentTaskId.slice(0, 6)}`,
              timestamp: now,
              duration: action === 'typing' ? 2000 : 5000,
            };
            eventMap.set(eventKey, event);
            events.push(event);

            // Remove after duration
            setTimeout(() => {
              eventMap.delete(eventKey);
              const idx = events.findIndex((e) => e.id === event.id);
              if (idx > -1) events.splice(idx, 1);
            }, event.duration);
          }
        }
      });

      // Simulate occasional conflicts
      if (Math.random() > 0.92 && presenceUsers.length > 1) {
        const idx1 = Math.floor(Math.random() * presenceUsers.length);
        const idx2 = (idx1 + 1) % presenceUsers.length;
        const user1 = presenceUsers[idx1];
        const user2 = presenceUsers[idx2];

        if (user1.currentTaskId === user2.currentTaskId && user1.mode === 'editing' && user2.mode === 'editing') {
          const conflictEvent: CollaborationEvent = {
            id: `conflict-${Date.now()}`,
            userId: user1.id,
            userName: `${user1.name} & ${user2.name}`,
            action: 'conflict',
            taskTitle: `Task #${user1.currentTaskId.slice(0, 6)}`,
            timestamp: Date.now(),
            duration: 3000,
          };
          events.push(conflictEvent);

          setTimeout(() => {
            const idx = events.findIndex((e) => e.id === conflictEvent.id);
            if (idx > -1) events.splice(idx, 1);
          }, 3000);
        }
      }
    };

    const interval = setInterval(simulateActivity, 1500);
    return () => clearInterval(interval);
  }, [presenceUsers]);
};
