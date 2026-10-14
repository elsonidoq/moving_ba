import { useApp } from '../state/context';
import { routeHash, safePlan } from '../state/navigation';

export default function SportChoice() {
  const { content, route } = useApp();
  if (route.screen !== 'choice') return null;
  const sport = content.sports.find(s => s.id === route.sportId)!;
  const plan = safePlan(content, route.profileId, sport.id);
  const { ui } = content;
  return <>
    <p className="eyebrow">{ui.choosePath}</p>
    <h1 tabIndex={-1}>{sport.name}</h1>
    <p className="lead">{sport.summary}</p>
    <div className="sport-hero"><img src={sport.heroAsset} alt={sport.heroAlt} /><span>{sport.environment}</span></div>
    <a className="route-card solo" href={routeHash({ screen: 'plan', profileId: route.profileId, sportId: sport.id, mode: 'solo', planId: plan.id })}>
      <span className="route-icon" aria-hidden="true">↗</span>
      <span><strong>{ui.solo}</strong><span>{ui.soloDescription}</span><small>{plan.duration} · {plan.level}</small></span>
      <span className="chevron" aria-hidden="true">›</span>
    </a>
    <a className="route-card classes" href={routeHash({ screen: 'catalog', profileId: route.profileId, sportId: sport.id, mode: 'classes' })}>
      <span className="route-icon" aria-hidden="true">+</span>
      <span><strong>{ui.classes}</strong><span>{ui.classesDescription}</span><small>{content.legal.fictionalClasses}</small></span>
      <span className="chevron" aria-hidden="true">›</span>
    </a>
    <section className="support"><h2>{ui.environment}</h2><p>{sport.facilities}</p><ul>{sport.tips.map(tip => <li key={tip}>{tip}</li>)}</ul></section>
    <p className="safety">{sport.safetyCopy}</p>
  </>;
}
