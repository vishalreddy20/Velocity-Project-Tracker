export const toDateOnly = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const formatDate = (value: string): string => {
  const date = toDateOnly(value);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const diffInDays = (from: Date, to: Date): number => {
  const ms = toDateOnly(to.toISOString().slice(0, 10)).getTime() - toDateOnly(from.toISOString().slice(0, 10)).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const dueLabel = (dueDate: string): { label: string; tone: 'normal' | 'warning' | 'danger' } => {
  const today = new Date();
  const due = toDateOnly(dueDate);

  if (isSameDay(today, due)) {
    return { label: 'Due Today', tone: 'warning' };
  }

  if (due < toDateOnly(today.toISOString().slice(0, 10))) {
    const overdueDays = Math.abs(diffInDays(due, today));
    if (overdueDays > 7) {
      return { label: `${overdueDays} days overdue`, tone: 'danger' };
    }
    return { label: `Overdue ${overdueDays}d`, tone: 'danger' };
  }

  return { label: formatDate(dueDate), tone: 'normal' };
};
