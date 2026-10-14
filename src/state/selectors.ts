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
  const month = history.filter(r => monthKey(r.activityDate) === monthKey(today) && r.activityDate <= today);
  const profile = content.profiles.find(p => p.id === (envelope.preference?.situationId ?? profileId))!;
  const points = history.length * content.rules.pointsPerCompletion;
  return {
    history, today, sessions: history.length, points,
    weekKeys: [...new Set(history.map(r => weekKey(r.activityDate)))].sort(),
    activeWeeks: metricValue(history, 'activeWeeks'), weeklySessions: week.length, weeklyGoal: profile.weeklyGoal,
    challenges: content.rules.challenges.map(rule => ({ ...rule, value: metricValue(rule.period === 'week' ? week : month, rule.metric) })),
    badges: content.rules.badges.map(rule => ({ ...rule, value: metricValue(history, rule.metric), earned: metricValue(history, rule.metric) >= rule.threshold })),
    benefits: content.rules.benefits.map(rule => ({ ...rule, eligible: points >= rule.pointsThreshold })),
  };
}

/** A projection is explicitly supplied; actual history/intention never enters this view. */
export function selectPreviewJourney(content: Content, scenarioId: string) {
  const scenario = content.previewScenarios.find(s => s.id === scenarioId);
  if (!scenario) return null;
  const journey = Object.fromEntries(scenario.history.map(h => {
    const plan = content.plans.find(p => p.id === h.planId)!;
    return [JSON.stringify(['preview',scenario.id,h.id]),{...h,profileId:scenario.recommendationSituationId,planTitle:plan.name,sportTitle:content.sports.find(s => s.id === h.sportId)!.name,medium:plan.medium,origin:'seed' as const}];
  }));
  return selectJourney(content,{schemaVersion:1,layout:'one-person',preference:{situationId:scenario.recommendationSituationId,confirmed:true},journey,interests:{},intention:null},scenario.recommendationSituationId,new Date(scenario.referenceDate+'T12:00:00Z'));
}
