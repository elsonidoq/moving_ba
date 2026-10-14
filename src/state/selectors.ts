import type { Content, Metric, ProfileId } from '../content/types';
import type { Envelope, HistoryRecord } from './storage';
import { activityDate, monthKey, weekKey } from './dates';

export function eligibleHistory(envelope: Envelope, profileId: ProfileId): HistoryRecord[] {
  const data = envelope.profiles[profileId];
  const unique = new Map<string, HistoryRecord>();
  for (const record of [...data.baselineHistory, ...Object.values(data.completions)]) {
    if (record.profileId === profileId && !unique.has(record.id)) unique.set(record.id, record);
  }
  return [...unique.values()].sort((a,b) => b.activityDate.localeCompare(a.activityDate) || a.id.localeCompare(b.id));
}
function metricValue(records: HistoryRecord[], metric: Metric): number {
  return metric === 'sessions' ? records.length : new Set(records.map(r => weekKey(r.activityDate))).size;
}
export function selectJourney(content: Content, envelope: Envelope, profileId: ProfileId, now = new Date()) {
  const history = eligibleHistory(envelope, profileId);
  const today = activityDate(now);
  const week = history.filter(r => weekKey(r.activityDate) === weekKey(today) && r.activityDate <= today);
  const month = history.filter(r => monthKey(r.activityDate) === monthKey(today) && r.activityDate <= today);
  const profile = content.profiles.find(p => p.id === profileId)!;
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
