import { useEffect, useRef } from 'react';
import type { Filters, Priority, Status, ViewMode } from '../types';
import { useTrackerStore } from '../store/useTrackerStore';

const parseList = <T,>(value: string | null): T[] => {
  if (!value) return [];
  return value.split(',').filter(Boolean) as T[];
};

const toQuery = (filters: Filters, view: ViewMode): string => {
  const params = new URLSearchParams();

  if (filters.statuses.length) params.set('status', filters.statuses.join(','));
  if (filters.priorities.length) params.set('priority', filters.priorities.join(','));
  if (filters.assignees.length) params.set('assignee', filters.assignees.join(','));
  if (filters.dueFrom) params.set('from', filters.dueFrom);
  if (filters.dueTo) params.set('to', filters.dueTo);
  params.set('view', view);

  const value = params.toString();
  return value ? `?${value}` : '';
};

const fromQuery = (search: string): { filters: Filters; view: ViewMode } => {
  const params = new URLSearchParams(search);
  const rawView = params.get('view');
  const view: ViewMode = rawView === 'list' || rawView === 'timeline' ? rawView : 'kanban';

  return {
    filters: {
      statuses: parseList<Status>(params.get('status')),
      priorities: parseList<Priority>(params.get('priority')),
      assignees: parseList<string>(params.get('assignee')),
      dueFrom: params.get('from') ?? '',
      dueTo: params.get('to') ?? '',
    },
    view,
  };
};

export const useUrlFilters = () => {
  const filters = useTrackerStore((state) => state.filters);
  const view = useTrackerStore((state) => state.view);
  const setFilters = useTrackerStore((state) => state.setFilters);
  const setView = useTrackerStore((state) => state.setView);

  const isPopState = useRef(false);
  const isInitialized = useRef(false);

  useEffect(() => {
    const applyUrl = () => {
      const parsed = fromQuery(window.location.search);
      isPopState.current = true;
      setFilters(parsed.filters);
      setView(parsed.view);
    };

    applyUrl();
    isInitialized.current = true;

    const onPopState = () => applyUrl();
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
    };
  }, [setFilters, setView]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (isPopState.current) {
      isPopState.current = false;
      return;
    }

    const next = `${window.location.pathname}${toQuery(filters, view)}`;
    const current = `${window.location.pathname}${window.location.search}`;

    if (next !== current) {
      window.history.pushState(null, '', next);
    }
  }, [filters, view]);
};
