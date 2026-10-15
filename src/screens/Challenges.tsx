import { useApp } from '../state/context';
import { selectJourney, selectPreviewJourney } from '../state/selectors';
import { routeHash } from '../state/navigation';
export default function Challenges() {
  const { content, route, envelope, mode } = useApp();
  const journey = mode.kind === 'preview' ? selectPreviewJourney(content, mode.scenarioId)! : selectJourney(content, envelope, route.profileId);
  const { ui } = content;
  return <>
    <h1 tabIndex={-1}>{ui.challenges}</h1>
    <section className="hero"><h2>{ui.points}</h2><p data-stat="points">{journey.points}</p><p>{ui.rest}</p></section>
    {journey.challenges.map(rule => <section className="support" key={rule.id} data-challenge-id={rule.id}>
      <h2>{rule.title}</h2><p>{rule.description}</p>
      <p>{ui[rule.period === 'week' ? 'thisWeek' : 'thisMonth']} · {ui[rule.metric === 'sessions' ? 'sessions' : 'activeWeeks']}</p>
      <p data-challenge-value>{rule.value} / {rule.target}</p><progress value={Math.min(rule.value,rule.target)} max={rule.target} aria-label={rule.title} />
    </section>)}
    <h2>{ui.badges}</h2>
    {journey.badges.map(rule => <section className="support" key={rule.id} data-badge-id={rule.id} data-earned={rule.earned}>
      <h3>{rule.title}</h3><p>{rule.description}</p><p>{rule.earned ? ui.earned : ui.nextAchievement}</p>
      <p>{ui[rule.metric === 'sessions' ? 'sessions' : 'activeWeeks']} · {rule.value} / {rule.threshold}</p>
    </section>)}
    <h2>{ui.benefits}</h2>
    {journey.benefits.map(rule => <section className="support" key={rule.id} data-benefit-id={rule.id}>
      <h3>{rule.title}</h3><p>{rule.description}</p><p>{ui.points} · {journey.points} / {rule.pointsThreshold}</p>
      <p>{rule.disclaimer}</p><p>{content.legal.noAgreement}</p><p>{content.legal.nonredeemable}</p>
    </section>)}
    <a className="button-link" href={routeHash({screen:'journey',profileId:route.profileId})}>{ui.journey}</a>
  </>;
}
