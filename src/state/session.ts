import type { Content, Exercise, ImageAssignment, ProfileId, SportId } from '../content/types';
import { activityDate, upsertCompletion, type Envelope } from './storage';

export interface Attempt {
  attemptId: string; profileId: ProfileId; sportId: SportId; planId: string;
  planTitle: string; sportTitle: string; medium: 'dry-land' | 'water';
  steps: { id: string; exercise: Exercise; image: ImageAssignment | null }[]; acceptedCount: number; viewIndex: number; status: 'active' | 'completed' | 'abandoned';
}
export interface StartInput { profileId: ProfileId; sportId: SportId; planId: string; canSwim: boolean; safePool: boolean }
export function startSession(content: Content, input: StartInput, id: () => string = () => crypto.randomUUID()): Attempt | null {
  const plan = content.plans.find(p => p.id === input.planId && p.profileId === input.profileId && p.sportId === input.sportId);
  if (!plan || !plan.steps.length || (plan.medium === 'water' && (plan.sportId !== 'swimming' || input.canSwim !== true || input.safePool !== true))) return null;
  const steps = plan.steps.map(step => {
    const exercise = content.exercises.find(e => e.id === step.exerciseId)!;
    const image = exercise?.imageStatus === 'verified' ? content.images.find(i => i.id === exercise.imageId) ?? null : null;
    return {id:step.id,exercise:structuredClone(exercise),image:structuredClone(image)};
  });
  if (steps.some(s => !s.exercise || s.exercise.sportId !== plan.sportId || (s.exercise.medium === 'water' && plan.medium !== 'water'))) return null;
  return { attemptId: id(), profileId: plan.profileId, sportId: plan.sportId, planId: plan.id, planTitle: plan.name, sportTitle: content.sports.find(s => s.id === plan.sportId)!.name, medium: plan.medium, steps, acceptedCount: 0, viewIndex: 0, status: 'active' };
}
export function abandonSession(attempt: Attempt | null): Attempt | null {
  return attempt?.status === 'active' ? { ...attempt, status: 'abandoned' } : attempt;
}
/** The only credit-producing transition: identity-checked explicit final acceptance. */
export function completeStep(attempt: Attempt | null, envelope: Envelope, attemptId: string, stepId: string, now = new Date()): { attempt: Attempt | null; envelope: Envelope } {
  if (!attempt || attempt.status !== 'active' || attempt.attemptId !== attemptId || attempt.viewIndex !== attempt.acceptedCount || attempt.steps[attempt.acceptedCount]?.id !== stepId) return { attempt, envelope };
  const acceptedCount = attempt.acceptedCount + 1;
  if (acceptedCount < attempt.steps.length) return {attempt:{...attempt,acceptedCount,viewIndex:acceptedCount},envelope};
  const completed = {...attempt,acceptedCount,status:'completed' as const};
  return { attempt: completed, envelope: upsertCompletion(envelope, {
    id: attemptId, attemptId, profileId: attempt.profileId, sportId: attempt.sportId, planId: attempt.planId,
    planTitle: attempt.planTitle, sportTitle: attempt.sportTitle, medium: attempt.medium,
    completedStepIds: attempt.steps.map(s => s.id), timestamp: now.toISOString(), activityDate: activityDate(now), origin: 'user-simulated',
  }) };
}

/** Review moves the view, never the accepted prefix; Next stops at the first unaccepted step. */
export function reviewStep(attempt: Attempt | null, attemptId: string, direction: 'previous' | 'next'): Attempt | null {
  if (!attempt || attempt.status !== 'active' || attempt.attemptId !== attemptId) return attempt;
  const viewIndex = attempt.viewIndex + (direction === 'previous' ? -1 : 1);
  if (viewIndex < 0 || viewIndex > attempt.acceptedCount || viewIndex >= attempt.steps.length) return attempt;
  return {...attempt,viewIndex};
}
