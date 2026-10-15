import type { Content, Metric, ProfileId } from '../content/types';
import type { Envelope, HistoryRecord } from './storage';
import { activityDate, monthKey, weekKey } from './dates';

export function eligibleHistory(envelope: Envelope, _profileId?: ProfileId): (HistoryRecord & {sourceKey:string})[] {
  return Object.entries(envelope.journey).sort(([a],[b]) => a.localeCompare(b)).map(([key,r]) => ({...r, sourceKey:key})).sort((a,b) => b.activityDate.localeCompare(a.activityDate) || a.sourceKey.localeCompare(b.sourceKey));
}
function metricValue(records: HistoryRecord[], metric: Metric): number {
  return metric === 'sessions' ? records.length : new Set(records.map(r => weekKey(r.activityDate))).size;
}
export function selectJourney(content: Content, envelope: Envelope, profileId: ProfileId, now = new Date()) {
  const history = eligibleHistory(envelope, profileId);
  const today = activityDate(now);
  const week = history.filter(r => weekKey(r.activityDate) === weekKey(today) && r.activityDate <= today);
  const activityDays = Array.from({length:7}, (_, index) => {
    const day = new Date(`${weekKey(today)}T12:00:00Z`);
    day.setUTCDate(day.getUTCDate() + index);
    const date = day.toISOString().slice(0,10);
    return {date, count: week.filter(record => record.activityDate === date).length};
  });
  const month = history.filter(r => monthKey(r.activityDate) === monthKey(today) && r.activityDate <= today);
  const profile = content.profiles.find(p => p.id === (envelope.preference?.situationId ?? profileId))!;
  const points = history.length * content.rules.pointsPerCompletion;
  return {
    history, today, activityDays, sessions: history.length, points,
    weekKeys: [...new Set(history.map(r => weekKey(r.activityDate)))].sort(),
    activeWeeks: metricValue(history, 'activeWeeks'), weeklySessions: week.length, weeklyGoal: profile.weeklyGoal,
    challenges: content.rules.challenges.map(rule => ({ ...rule, value: metricValue(rule.period === 'week' ? week : month, rule.metric) })),
    badges: content.rules.badges.map(rule => ({ ...rule, value: metricValue(history, rule.metric), earned: metricValue(history, rule.metric) >= rule.threshold })),
    benefits: content.rules.benefits.map(rule => ({ ...rule, eligible: points >= rule.pointsThreshold })),
  };
}

/** A projection is explicitly supplied; actual history/intention never enters this view. */
export type BenefitPresentation = {
  mode: 'actual' | 'preview';
  journey: ReturnType<typeof selectJourney>;
  baseline: number;
  earnedPoints: number;
  displayPoints: number;
  benefits: (Content['rules']['benefits'][number] & { eligible: boolean; remaining: number })[];
  selectedBenefit: (Content['rules']['benefits'][number] & { eligible: boolean; remaining: number }) | null;
};

/** Read-only point presentation: actual situations add an example baseline; previews never do. */
export function selectBenefitPresentation(content: Content, envelope: Envelope, profileId: ProfileId, previewScenarioId?: string): BenefitPresentation | null {
  const preview = previewScenarioId ? selectPreviewJourney(content, previewScenarioId) : null;
  if (previewScenarioId && !preview) return null;
  const actualProfileId = envelope.preference?.situationId ?? profileId;
  const profile = content.profiles.find(item => item.id === actualProfileId)!;
  const scenario = content.scenarios.profiles.find(item => item.id === profile.scenarioId)!;
  const journey = preview ?? selectJourney(content, envelope, actualProfileId);
  const baseline = preview ? 0 : scenario.history.length * content.rules.pointsPerCompletion;
  const earnedPoints = preview ? 0 : journey.points;
  const displayPoints = preview ? journey.points : baseline + earnedPoints;
  const benefits = content.rules.benefits.map(benefit => ({...benefit, eligible: displayPoints >= benefit.pointsThreshold, remaining: Math.max(0, benefit.pointsThreshold - displayPoints)}));
  const selectedBenefit = [...benefits].sort((a, b) => a.eligible !== b.eligible ? (a.eligible ? -1 : 1) : a.eligible ? b.pointsThreshold - a.pointsThreshold || a.id.localeCompare(b.id) : a.pointsThreshold - b.pointsThreshold || a.id.localeCompare(b.id))[0] ?? null;
  return {mode: preview ? 'preview' : 'actual', journey, baseline, earnedPoints, displayPoints, benefits, selectedBenefit};
}

export function selectPreviewJourney(content: Content, scenarioId: string) {
  const scenario = content.previewScenarios.find(s => s.id === scenarioId);
  if (!scenario) return null;
  const journey = Object.fromEntries(scenario.history.map(h => {
    const plan = content.plans.find(p => p.id === h.planId)!;
    return [JSON.stringify(['preview',scenario.id,h.id]),{...h,profileId:scenario.recommendationSituationId,planTitle:plan.name,sportTitle:content.sports.find(s => s.id === h.sportId)!.name,medium:plan.medium,origin:'seed' as const}];
  }));
  return selectJourney(content,{schemaVersion:1,layout:'one-person',preference:{situationId:scenario.recommendationSituationId,confirmed:true},journey,interests:{},intention:null},scenario.recommendationSituationId,new Date(scenario.referenceDate+'T12:00:00Z'));
}
