import { useState, useEffect } from 'react';

const DAILY_LIMIT = 50;
const STORAGE_KEY = 'pdfcraft_usage';

interface UsageData {
  count: number;
  date: string;
  isPremium: boolean;
}

export const useUsageLimit = () => {
  const [usage, setUsage] = useState<UsageData>({
    count: 0,
    date: new Date().toDateString(),
    isPremium: false
  });

  useEffect(() => {
    const savedUsage = localStorage.getItem(STORAGE_KEY);
    if (savedUsage) {
      const parsedUsage = JSON.parse(savedUsage);
      const today = new Date().toDateString();
      
      if (parsedUsage.date !== today) {
        // Reset count for new day
        const newUsage = { ...parsedUsage, count: 0, date: today };
        setUsage(newUsage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      } else {
        setUsage(parsedUsage);
      }
    }
  }, []);

  const incrementUsage = () => {
    if (usage.isPremium) return true;
    
    if (usage.count >= DAILY_LIMIT) return false;
    
    const newUsage = { ...usage, count: usage.count + 1 };
    setUsage(newUsage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
    return true;
  };

  const upgradeToPremium = () => {
    const newUsage = { ...usage, isPremium: true };
    setUsage(newUsage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
  };

  const canUseFeature = usage.isPremium || usage.count < DAILY_LIMIT;
  const remainingUses = usage.isPremium ? Infinity : DAILY_LIMIT - usage.count;

  return {
    canUseFeature,
    remainingUses,
    incrementUsage,
    upgradeToPremium,
    isPremium: usage.isPremium
  };
};