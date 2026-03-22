import { useEffect } from 'react';
import type { PresenceUser } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';

const simulatedUsers: Omit<PresenceUser, 'currentTaskId' | 'mode'>[] = [
  { id: 'p1', name: 'Nora', initials: 'NO', color: '#ec4899' },
  { id: 'p2', name: 'Ethan', initials: 'ET', color: '#f59e0b' },
  { id: 'p3', name: 'Riya', initials: 'RI', color: '#10b981' },
  { id: 'p4', name: 'Kai', initials: 'KA', color: '#3b82f6' },
];

const randomTask = (ids: string[]) => ids[Math.floor(Math.random() * ids.length)];

const pickUsers = (count: number): typeof simulatedUsers => {
  const pool = [...simulatedUsers].sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
};

export const usePresenceSimulation = (taskIds: string[]) => {
  const setPresenceUsers = useTrackerStore((state) => state.setPresenceUsers);

  useEffect(() => {
    if (taskIds.length === 0) {
      setPresenceUsers([]);
      return;
    }

    // Start with stable 2-3 users
    let active = pickUsers(2 + Math.floor(Math.random() * 2)).map((user) => ({
      ...user,
      currentTaskId: randomTask(taskIds),
      mode: Math.random() > 0.65 ? 'editing' : 'viewing',
    })) as PresenceUser[];

    setPresenceUsers(active);

    // Stable interval: only update position and mode, rare member changes
    const id = window.setInterval(() => {
      const activeMap = new Map(active.map((user) => [user.id, user]));

      // 85% of the time: only move existing users and update mode
      // 15% of the time: rare user join/leave
      const memberChangeOdds = Math.random();

      if (memberChangeOdds < 0.15) {
        // Rare: small member change (add or remove 1 user)
        const changeType = Math.random() > 0.5 ? 'add' : 'remove';

        if (changeType === 'add' && active.length < 4) {
          // Add 1 new user
          const newUser = pickUsers(1).find((u) => !activeMap.has(u.id));
          if (newUser) {
            active = [
              ...active,
              {
                ...newUser,
                currentTaskId: randomTask(taskIds),
                mode: 'viewing',
              },
            ];
          }
        } else if (changeType === 'remove' && active.length > 2) {
          // Remove 1 user
          active = active.slice(1);
        }
      } else {
        // Normal update: move users and change modes
        active = active.map((user) => {
          const shouldMove = Math.random() > 0.3;
          return {
            ...user,
            currentTaskId: shouldMove ? randomTask(taskIds) : user.currentTaskId,
            mode: Math.random() > 0.7 ? 'editing' : 'viewing',
          };
        });
      }

      setPresenceUsers(active);
    }, 2500); // Stable 2.5s updates

    return () => {
      window.clearInterval(id);
    };
  }, [setPresenceUsers, taskIds]);
};
