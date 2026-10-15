import { sourceKey } from '../state/storage';
import { useApp } from '../state/context';
import { routeHash, safePlan } from '../state/navigation';
export default function Success() {
  const { content, route, envelope } = useApp();
  if (route.screen !== 'success') return null;
  const record = envelope.journey[sourceKey('actual','completion',route.attemptId)];
  if (!record) return null;
  const plan = safePlan(content, route.profileId, route.sportId);
  return <article data-completed-attempt-id={record.id}>
    <h1 tabIndex={-1}>{content.ui.success}</h1>
    <p>{record.planTitle}</p><p>{content.ui.simulatedOrigin}</p>
    <p>{content.profiles.find(p => p.id === route.profileId)!.nextPrompt}</p>
    <a className="button-link secondary" href={routeHash({ screen: 'plan', profileId: route.profileId, sportId: route.sportId, mode: 'solo', planId: plan.id })}>{content.ui.next}</a>
    <a className="button-link" href={routeHash({screen:'journey',profileId:route.profileId})}>{content.ui.journey}</a>
    <p className="support">{content.ui.rest}</p>
  </article>;
}
