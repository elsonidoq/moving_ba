import { useApp } from '../state/context';
import { selectBenefitPresentation } from '../state/selectors';
import { routeHash } from '../state/navigation';

function BadgeIcon({ trophy }: { trophy: boolean }) {
  return <svg viewBox="0 0 48 48" width="34" height="34" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {trophy ? <><path d="M13 8h22v13c0 8-5 13-11 13s-11-5-11-13V8Z" fill="#ffd500" /><path d="M13 13H7v5c0 6 4 9 9 9M35 13h6v5c0 6-4 9-9 9M24 34v7m-9 2h18" /><path d="m24 14 2 4 4 .6-3 3 .8 4.4-3.8-2-3.8 2 .8-4.4-3-3 4-.6Z" fill="white" /></> : <><path d="m11 5 9 2 4 13-9-3-4-12Zm26 0-9 2-4 13 9-3 4-12Z" fill="#83bade" /><circle cx="24" cy="29" r="13" fill="#ffd500" /><path d="m24 21 2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7Z" fill="white" /></>}
  </svg>;
}

export default function Challenges() {
  const { content, route, envelope, mode } = useApp();
  const presentation = selectBenefitPresentation(content, envelope, route.profileId, mode.kind === 'preview' ? mode.scenarioId : undefined)!;
  const journey = presentation.journey;
  const { ui } = content;
  const situation = content.onboarding.choices.find(choice => choice.id === route.profileId)!.label;
  return <article className="rewards-page">
    <h1 tabIndex={-1}>{ui.challenges}</h1>
    <section className="rewards-hero" aria-label={presentation.mode === 'preview' ? ui.previewPoints : ui.illustrativePoints}>
      <span className="rewards-hero-icon" aria-hidden="true">✦</span>
      <div><span>{presentation.mode === 'preview' ? `Escenario simulado · ${ui.previewPoints}` : ui.illustrativeProgress.replace('{situation}',situation)}</span><strong data-stat="points">{presentation.displayPoints}</strong><p>{presentation.mode === 'preview' ? 'Ejemplo de un escenario simulado.' : ui.exampleBase.replace('{baseline}',String(presentation.baseline))}</p>{presentation.mode === 'actual' && <p>{ui.savedJourneyPoints.replace('{earned}',String(presentation.earnedPoints))}</p>}</div>
    </section>
    <h2 className="section-title">Desafíos para seguir</h2>
    <div className="challenge-list">{journey.challenges.map((rule, index) => <section className="challenge-tile" key={rule.id} data-challenge-id={rule.id}>
      <span className="challenge-icon" aria-hidden="true">{index === 0 ? '⚡' : '↗'}</span>
      <div><h3>{rule.title}</h3><p>{rule.description}</p>
        <p className="challenge-caption">{ui[rule.period === 'week' ? 'thisWeek' : 'thisMonth']} · {ui[rule.metric === 'sessions' ? 'sessions' : 'activeWeeks']}</p>
        <div className="challenge-meter"><span data-challenge-value>{rule.value} / {rule.target}</span><progress value={Math.min(rule.value,rule.target)} max={rule.target} aria-label={`${rule.title}: ${rule.value} de ${rule.target}`} /></div>
      </div>
    </section>)}</div>
    <h2 className="section-title">{ui.badges}</h2>
    <div className="badge-list">{journey.badges.map((rule, index) => <section className="badge-tile" key={rule.id} data-badge-id={rule.id} data-earned={rule.earned}>
      <span className="badge-icon"><BadgeIcon trophy={index !== 0} /></span>
      <div><h3>{rule.title}</h3><p>{rule.description}</p><p className="badge-progress">{rule.earned ? ui.earned : ui.nextAchievement} · {rule.value} / {rule.threshold}</p></div>
    </section>)}</div>
    <h2 className="section-title" id="benefits">{ui.benefits}</h2>
    <div className="benefit-list">{presentation.benefits.map(rule => <section className="benefit-card" key={rule.id} data-benefit-id={rule.id}>
      <img src={rule.photo.path} alt={rule.photo.alt} loading="lazy" onError={event => { event.currentTarget.hidden = true; }} />
      <div className="benefit-copy"><h3>{rule.title}</h3><p>{rule.description}</p>
        <span className="benefit-points">{rule.eligible ? ui.benefitReached : ui.benefitRemaining.replace('{count}',String(rule.remaining))}</span>
        <progress value={Math.min(presentation.displayPoints, rule.pointsThreshold)} max={Math.max(1, rule.pointsThreshold)} aria-label={`${rule.title}: ${presentation.displayPoints} de ${rule.pointsThreshold} puntos`} />
      </div>
    </section>)}</div>
    {!presentation.benefits.length && <p role="status">{ui.benefitsEmpty}</p>}
    <p className="benefit-availability" data-benefit-limitation>{ui.benefitsDisclaimer}</p>
    <a className="button-link" href={routeHash({screen:'journey',profileId:route.profileId})}>{ui.journey}</a>
  </article>;
}
