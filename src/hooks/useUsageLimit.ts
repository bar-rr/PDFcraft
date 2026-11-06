import { useSyncExternalStore } from 'react';

const DAILY_LIMIT = 50;
const STORAGE_KEY = 'pdfcraft_usage';

interface UsageData {
  count: number;
  date: string;
  isPremium: boolean;
}

const today = () => new Date().toDateString();

const load = (): UsageData => {
  const fresh: UsageData = { count: 0, date: today(), isPremium: false };
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return fresh;
    const parsed = JSON.parse(saved) as UsageData;
    return parsed.date === today() ? parsed : { ...parsed, count: 0, date: today() };
  } catch {
    return fresh;
  }
};

// One shared store so the header counter and every card always agree.
let state: UsageData = load();
const listeners = new Set<() => void>();

const setState = (next: UsageData) => {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep in memory only */
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

const incrementUsage = (): boolean => {
  if (state.date !== today()) state = { ...state, count: 0, date: today() };
  if (state.isPremium) return true;
  if (state.count >= DAILY_LIMIT) return false;
  setState({ ...state, count: state.count + 1 });
  return true;
};

const upgradeToPremium = () => setState({ ...state, isPremium: true });

export const useUsageLimit = () => {
  const usage = useSyncExternalStore(subscribe, getSnapshot);
  const canUseFeature = usage.isPremium || usage.count < DAILY_LIMIT;
  const remainingUses = usage.isPremium ? Infinity : Math.max(0, DAILY_LIMIT - usage.count);

  return {
    canUseFeature,
    remainingUses,
    incrementUsage,
    upgradeToPremium,
    isPremium: usage.isPremium,
    dailyLimit: DAILY_LIMIT
  };
};
