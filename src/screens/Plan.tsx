import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

export default function Plan() {
  const { content, route, start, canSwim, safePool, affirm, status } = useApp();
  if (route.screen !== 'plan') return null;
  const plan = content.plans.find(p => p.id === route.planId)!;
  const sport = content.sports.find(s => s.id === route.sportId)!;
  const { ui } = content;
  return <article data-plan-id={plan.id}>
    <p className="eyebrow">{ui.planPreview}</p>
    <h1 tabIndex={-1}>{plan.name}</h1>
    <p className="lead">{plan.description}</p>
    <div className="sport-hero compact"><img src={sport.heroAsset} alt={sport.heroAlt} /></div>
    {sport.id === 'swimming' && <p className="medium-label">{ui.dryLand}</p>}
    <dl className="plan-meta">
      <div><dt>{ui.duration}</dt><dd>{plan.duration}</dd></div>
      <div><dt>{ui.level}</dt><dd>{plan.level}</dd></div>
      <div><dt>{ui.environment}</dt><dd>{plan.environment}</dd></div>
    </dl>
    <section className="support"><h2>{ui.prerequisites}</h2><ul>{plan.prerequisites.map(item => <li key={item}>{item}</li>)}</ul></section>
    <h2 className="section-title">{ui.steps}</h2>
    <ol className="exercise-list">
      {plan.steps.map((step, index) => {
        const exercise = content.exercises.find(e => e.id === step.exerciseId)!;
        return <li key={step.id} data-step-id={step.id} data-exercise-id={exercise.id}>
          <span className="step-number" aria-hidden="true">{index + 1}</span>
          <div><h3>{exercise.title}</h3><p className="quantity">{exercise.quantity}</p><p>{exercise.technique}</p></div>
        </li>;
      })}
    </ol>
    <section className="safety"><h2>{ui.safety}</h2><p>{plan.safetyCopy}</p></section>
    <button disabled={status === 'invalid'} onClick={() => start()}>{ui.start}</button>
    {sport.id === 'swimming' && <section className="support">
      <label className="affirmation"><input type="checkbox" checked={canSwim} onChange={e => affirm('canSwim', e.target.checked)} />{ui.canSwim}</label>
      <label className="affirmation"><input type="checkbox" checked={safePool} onChange={e => affirm('safePool', e.target.checked)} />{ui.safePool}</label>
      <button disabled={!canSwim || !safePool || status === 'invalid'} onClick={() => start(true)}>{ui.startWater}</button>
      <p>{ui.swimRedirect}</p><a className="button-link" href={routeHash({ screen: 'catalog', profileId: route.profileId, sportId: sport.id, mode: 'classes' })}>{ui.classes}</a></section>}
  </article>;
}
