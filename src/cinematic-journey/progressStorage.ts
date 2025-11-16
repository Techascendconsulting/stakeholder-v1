import { JourneyPhase, JourneyPhases } from './types';

const STORAGE_KEY = 'cinematicJourneyProgress';

export interface JourneyProgress {
  [phaseId: string]: {
    [stepId: string]: boolean; // true = completed
  };
}

export function loadProgress(): JourneyProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed as JourneyProgress : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: JourneyProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore storage errors
  }
}

export function markStepComplete(phaseId: string, stepId: string): JourneyProgress {
  const progress = loadProgress();
  if (!progress[phaseId]) progress[phaseId] = {};
  progress[phaseId][stepId] = true;
  saveProgress(progress);
  return progress;
}

export function isPhaseCompleted(phase: JourneyPhase, progress: JourneyProgress): boolean {
  const p = progress[phase.id] || {};
  return phase.steps.length > 0 && phase.steps.every(s => !!p[s.id]);
}

export function isPhaseLocked(phase: JourneyPhase, progress: JourneyProgress, phases: JourneyPhases): boolean {
  if (phase.order === 0) return false; // P0 never locked
  const prev = phases.find(p => p.order === phase.order - 1);
  if (!prev) return false; // if previous not found, unlock by default
  return !isPhaseCompleted(prev, progress);
}


