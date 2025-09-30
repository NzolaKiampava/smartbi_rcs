import React, { createContext, useContext, useEffect, useState } from 'react';

interface GamificationContextType {
  points: number;
  addPoints: (n: number) => void;
  resetPoints: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<number>(() => {
    const v = localStorage.getItem('smartbi_points');
    return v ? parseInt(v, 10) : 0;
  });

  useEffect(() => {
    try { localStorage.setItem('smartbi_points', String(points)); } catch (err) { /* ignore */ }
  }, [points]);

  const addPoints = (n: number) => setPoints(p => Math.max(0, p + n));
  const resetPoints = () => setPoints(0);

  return (
    <GamificationContext.Provider value={{ points, addPoints, resetPoints }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
};

export default GamificationContext;
