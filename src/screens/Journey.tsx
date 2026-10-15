import { useApp } from '../state/context';
import { routeHash, safePlan } from '../state/navigation';
import { selectJourney, selectPreviewJourney } from '../state/selectors';
import { displayDate } from '../state/dates';
export default function Journey() {
  const { content, route, envelope, mode } = useApp();
  const profile = content.profiles.find(p => p.id === route.profileId)!;
  const journey = mode.kind === 'preview' ? selectPreviewJourney(content, mode.scenarioId)! : selectJourney(content, envelope, profile.id);
  const plan = safePlan(content, profile.id, profile.defaultSportId);
  const { ui } = content;
  return <>
    <h1 tabIndex={-1}>{ui.journey}</h1><p className="lead">{profile.subtitle}</p>
    {profile.id === 'returning' && <p className="support">{ui.pause}</p>}
    <dl className="journey-stats">
      <div><dt>{ui.sessions}</dt><dd data-stat="sessions">{journey.sessions}</dd></div>
      <div><dt>{ui.activeWeeks}</dt><dd data-stat="activeWeeks">{journey.activeWeeks}</dd></div>
      <div><dt>{mode.kind === 'preview' ? ui.previewPoints : ui.savedJourneyPointsLabel}</dt><dd data-stat="points">{journey.points}</dd></div>
    </dl>
    <section className="support"><h2>{ui.weeklyGoal}</h2><p data-stat="weeklyGoal">{journey.weeklySessions} / {journey.weeklyGoal}</p>
      <progress value={Math.min(journey.weeklySessions, journey.weeklyGoal)} max={journey.weeklyGoal} aria-label={ui.weeklyGoal} /><p>{ui.rest}</p>
    </section>
    <section className="hero"><h2>{ui.next}</h2><p>{profile.nextPrompt}</p>
      <a className="button-link" href={routeHash({screen:'plan',profileId:profile.id,sportId:plan.sportId,mode:'solo',planId:plan.id})}>{plan.name}</a>
    </section>
    <h2>{ui.history}</h2>
    {!journey.history.length ? <p>{ui.historyEmpty}</p> : <ol className="history-list">{journey.history.map(record => <li key={record.sourceKey} data-history-id={record.sourceKey}>
      <strong>{record.planTitle}</strong><p className="muted">{content.onboarding.choices.find(c => c.id === record.profileId)?.label}</p><p>{record.sportTitle} · <time dateTime={record.activityDate}>{displayDate(record.activityDate)}</time></p>
      {record.sportId === 'swimming' && <p>{ui[record.medium === 'water' ? 'water' : 'dryLand']}</p>}<p className="muted">{record.origin === 'seed' ? ui.seedOrigin : ui.simulatedOrigin}</p>
    </li>)}</ol>}
    {!!journey.weekKeys.length && <section><h2>{ui.activeWeeks}</h2><ul>{journey.weekKeys.map(key => <li key={key} data-week-key={key}>{ui.weekOf} {displayDate(key)}</li>)}</ul></section>}
    <a className="button-link secondary" href={routeHash({screen:'challenges',profileId:profile.id})}>{ui.challenges}</a>
  </>;
}
