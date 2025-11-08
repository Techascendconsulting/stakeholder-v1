import { useEffect, useState, useCallback } from 'react';
import { getUnitProgress, upsertProgress, markCompleted } from '../services/progress';
import type { ContentUnitRef, UserProgress } from '../types/content';
import { supabase } from '../lib/supabase';

export function useProgress(unit: ContentUnitRef) {
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id ?? null));
    return () => { s.data.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!userId) { setProgress(null); setLoading(false); return; }
    let isMounted = true;
    setLoading(true);
    getUnitProgress(userId, unit).then(p => {
      if (isMounted) { setProgress(p); setLoading(false); }
    }).catch(() => setLoading(false));
    return () => { isMounted = false; };
  }, [userId, unit.unitType, unit.stableKey, unit.contentVersion]);

  const setPercent = useCallback(async (nextPercent: number, lastPosition: any = {}) => {
    if (!userId) return;
    const res = await upsertProgress({ userId, unit, percent: nextPercent, lastPosition });
    const updated = await getUnitProgress(userId, unit);
    setProgress(updated);
    return res;
  }, [userId, unit]);

  const complete = useCallback(async () => {
    if (!userId) return;
    const res = await markCompleted(userId, unit);
    const updated = await getUnitProgress(userId, unit);
    setProgress(updated);
    return res;
  }, [userId, unit]);

  return { loading, userId, progress, setPercent, complete };
}





