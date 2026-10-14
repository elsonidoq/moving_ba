import type { Content, Exercise, ProfileId, SportId } from '../content/types';
import { activityDate, upsertCompletion, type Envelope } from './storage';

export interface Attempt {
  attemptId: string; profileId: ProfileId; sportId: SportId; planId: string;
  planTitle: string; sportTitle: string; medium: 'dry-land' | 'water';
  steps: { id: string; exercise: Exercise }[]; cursor: number; status: 'active' | 'completed' | 'abandoned';
}
export interface StartInput { profileId: ProfileId; sportId: SportId; planId: string; canSwim: boolean; safePool: boolean }
export function startSession(content: Content, input: StartInput, id: () => string = () => crypto.randomUUID()): Attempt | null {
  const plan = content.plans.find(p => p.id === input.planId && p.profileId === input.profileId && p.sportId === input.sportId);
  if (!plan || !plan.steps.length || (plan.medium === 'water' && (plan.sportId !== 'swimming' || input.canSwim !== true || input.safePool !== true))) return null;
  const steps = plan.steps.map(step => ({ id: step.id, exercise: structuredClone(content.exercises.find(e => e.id === step.exerciseId)!) }));
  if (steps.some(s => !s.exercise || s.exercise.sportId !== plan.sportId || (s.exercise.medium === 'water' && plan.medium !== 'water'))) return null;
  return { attemptId: id(), profileId: plan.profileId, sportId: plan.sportId, planId: plan.id, planTitle: plan.name, sportTitle: content.sports.find(s => s.id === plan.sportId)!.name, medium: plan.medium, steps, cursor: 0, status: 'active' };
}
export function abandonSession(attempt: Attempt | null): Attempt | null {
  return attempt?.status === 'active' ? { ...attempt, status: 'abandoned' } : attempt;
}
/** The only credit-producing transition: identity-checked explicit final acceptance. */
export function completeStep(attempt: Attempt | null, envelope: Envelope, attemptId: string, stepId: string, now = new Date()): { attempt: Attempt | null; envelope: Envelope } {
  if (!attempt || attempt.status !== 'active' || attempt.attemptId !== attemptId || attempt.steps[attempt.cursor]?.id !== stepId) return { attempt, envelope };
  const cursor = attempt.cursor + 1;
  if (cursor < attempt.steps.length) return { attempt: { ...attempt, cursor }, envelope };
  const completed = { ...attempt, cursor, status: 'completed' as const };
  return { attempt: completed, envelope: upsertCompletion(envelope, {
    id: attemptId, attemptId, profileId: attempt.profileId, sportId: attempt.sportId, planId: attempt.planId,
    planTitle: attempt.planTitle, sportTitle: attempt.sportTitle, medium: attempt.medium,
    completedStepIds: attempt.steps.map(s => s.id), timestamp: now.toISOString(), activityDate: activityDate(now), origin: 'user-simulated',
  }) };
}
