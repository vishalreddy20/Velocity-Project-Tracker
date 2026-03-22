import type { Priority, Status, Task, User } from '../types';

const STATUSES: Status[] = ['todo', 'in-progress', 'in-review', 'done'];
const PRIORITIES: Priority[] = ['critical', 'high', 'medium', 'low'];

const TITLE_PARTS_A = [
  'Design',
  'Build',
  'Refactor',
  'Document',
  'Validate',
  'Polish',
  'Automate',
  'Review',
  'Scale',
  'Fix',
];

const TITLE_PARTS_B = [
  'API',
  'dashboard',
  'onboarding',
  'search flow',
  'notifications',
  'task engine',
  'analytics',
  'timeline',
  'auth layer',
  'filter panel',
];

export const seedUsers: User[] = [
  { id: 'u1', name: 'Ava Singh', initials: 'AS', color: '#f97316' },
  { id: 'u2', name: 'Noah Patel', initials: 'NP', color: '#0ea5e9' },
  { id: 'u3', name: 'Mia Sharma', initials: 'MS', color: '#22c55e' },
  { id: 'u4', name: 'Liam Rao', initials: 'LR', color: '#e11d48' },
  { id: 'u5', name: 'Zara Khan', initials: 'ZK', color: '#8b5cf6' },
  { id: 'u6', name: 'Arjun Das', initials: 'AD', color: '#14b8a6' },
];

const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const toIso = (date: Date): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const generateTasks = (count = 520): Task[] => {
  const today = new Date();
  const tasks: Task[] = [];

  for (let i = 0; i < count; i += 1) {
    const dueOffset = Math.floor(Math.random() * 48) - 18;
    const due = new Date(today);
    due.setDate(today.getDate() + dueOffset);

    const hasStartDate = Math.random() > 0.18;
    let startDate: string | null = null;

    if (hasStartDate) {
      const startOffset = dueOffset - Math.floor(Math.random() * 9);
      const start = new Date(today);
      start.setDate(today.getDate() + startOffset);
      startDate = toIso(start);
    }

    const status = randomItem(STATUSES);
    const title = `${randomItem(TITLE_PARTS_A)} ${randomItem(TITLE_PARTS_B)} #${i + 1}`;

    tasks.push({
      id: `task-${i + 1}`,
      title,
      assigneeId: randomItem(seedUsers).id,
      priority: randomItem(PRIORITIES),
      status,
      startDate,
      dueDate: toIso(due),
      order: i,
    });
  }

  return tasks;
};
