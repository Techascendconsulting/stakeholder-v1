import { supabase } from '../lib/supabase';
import type { ContentUnitRef, ProgressStatus, UserProgress } from '../types/content';

function coerceStatus(percent: number): ProgressStatus {
  if (percent >= 100) return 'completed';
  if (percent > 0) return 'in_progress';
  return 'not_started';
}

export async function getProgressMapForUser(userId: string): Promise<Record<string, UserProgress>> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  const map: Record<string, UserProgress> = {};
  (data ?? []).forEach(p => { map[`${p.unit_type}:${p.stable_key}`] = p as UserProgress; });
  return map;
}

/**
 * Upsert progress idempotently for any unit.
 * - Keeps status if version matches
 * - If content_version increased, mark 'stale' unless percent is 100 and you want to carry forward
 */
export async function upsertProgress(opts: {
  userId: string;
  unit: ContentUnitRef;
  percent?: number;                 // 0..100
  lastPosition?: any;
  forceComplete?: boolean;          // optionally mark as completed regardless of percent
  carryForwardOnVersionBump?: boolean; // if true and user had completed older version, keep completed
}) {
  const { userId, unit, percent = 0, lastPosition = {}, forceComplete = false, carryForwardOnVersionBump = true } = opts;

  // fetch any existing row
  const { data: existingRows, error: getErr } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('unit_type', unit.unitType)
    .eq('stable_key', unit.stableKey)
    .limit(1);

  if (getErr) throw getErr;
  const existing = existingRows?.[0] as UserProgress | undefined;

  let newPercent = percent;
  let newStatus: ProgressStatus = coerceStatus(newPercent);
  let contentVersion = unit.contentVersion;

  if (forceComplete) {
    newPercent = 100;
    newStatus = 'completed';
  }

  if (existing) {
    // If author bumped version
    if (existing.content_version < unit.contentVersion) {
      if (carryForwardOnVersionBump && existing.status === 'completed') {
        // keep completed status (optional rule)
        contentVersion = unit.contentVersion;
        newPercent = 100;
        newStatus = 'completed';
      } else {
        // mark stale and keep previous percent until user re-enters
        contentVersion = unit.contentVersion;
        newStatus = 'stale';
        newPercent = Math.min(existing.percent, newPercent);
      }
    } else {
      // same version → take the higher progress
      newPercent = Math.max(existing.percent, newPercent);
      newStatus = coerceStatus(newPercent);
    }
  }

  // Upsert
  const { error: upsertErr } = await supabase.from('user_progress').upsert({
    user_id: userId,
    unit_type: unit.unitType,
    stable_key: unit.stableKey,
    content_version: contentVersion,
    status: newStatus,
    percent: newPercent,
    last_position: lastPosition,
    completed_at: (newStatus === 'completed') ? new Date().toISOString() : null,
  }, { onConflict: 'user_id,unit_type,stable_key' });

  if (upsertErr) throw upsertErr;

  return { status: newStatus, percent: newPercent, contentVersion };
}

export async function getUnitProgress(userId: string, unit: ContentUnitRef) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('unit_type', unit.unitType)
    .eq('stable_key', unit.stableKey)
    .maybeSingle();
  if (error) throw error;
  return data as UserProgress | null;
}

export async function markCompleted(userId: string, unit: ContentUnitRef) {
  return upsertProgress({ userId, unit, percent: 100, forceComplete: true });
}

















