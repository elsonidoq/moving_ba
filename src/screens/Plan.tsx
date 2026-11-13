import { useState } from 'react';
import { publicUrl } from '../content/publicUrl';
import type { Plan as PlanContent, UI } from '../content/types';
import { sportPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

function DurationEstimate({plan,ui}:{plan:PlanContent;ui:UI}) {
  const [minutes,setMinutes]=useState(plan.durationOptions[0]);
  const label=(value:number)=>ui.durationOption.replace('{minutes}',String(value));
  return <div className="duration-estimate">{plan.durationOptions.length>1?<label htmlFor={`duration-${plan.id}`}>{ui.duration}</label>:<span className="duration-label">{ui.duration}</span>}
    {plan.durationOptions.length>1 ? <select id={`duration-${plan.id}`} value={minutes} onChange={event=>setMinutes(Number(event.target.value))}>{plan.durationOptions.map(value=><option key={value} value={value}>{label(value)}</option>)}</select> : <p id={`duration-${plan.id}`}>{label(minutes)}</p>}
  </div>;
}
export default function Plan() {
  const { content, route, start, canSwim, safePool, affirm, status, mode } = useApp();
  if (route.screen !== 'plan') return null;
  const plan = content.plans.find(p => p.id === route.planId)!;
  const sport = content.sports.find(s => s.id === route.sportId)!;
  const { ui } = content;
  const waterPlan = content.plans.find(p => p.profileId === plan.profileId && p.sportId === sport.id && p.medium === 'water');
  const stepList = (steps: typeof plan.steps) => <ol className="exercise-list">
    {steps.map((step, index) => {
      const exercise = content.exercises.find(e => e.id === step.exerciseId)!;
      const image = content.images.find(image => image.id === exercise.imageId);
      return <li key={step.id} data-step-id={step.id} data-exercise-id={exercise.id}>
        {image?.path ? <img className="step-photo" src={publicUrl(image.path)} alt={image.alt} /> : <span className="muted">{ui.imageUnavailable}</span>}
        <span className="step-number" aria-hidden="true">{index + 1}</span>
        <div><h3>{exercise.title}</h3><p className="quantity">{exercise.quantity}</p><p>{exercise.technique}</p></div>
      </li>;
    })}
  </ol>;
  return <article data-plan-id={plan.id}>
    <p className="eyebrow">{ui.planPreview}</p>
    <h1 tabIndex={-1}>{plan.name}</h1>
    <p className="lead">{plan.description}</p>
    <div className="sport-hero compact"><img src={publicUrl(sportPhotos[sport.id].hero.src)} alt={sportPhotos[sport.id].hero.alt} /></div>
    {sport.id === 'swimming' && <p className="medium-label">{ui.dryLand}</p>}
    <dl className="plan-meta">
      <div><dt className="visually-hidden">{ui.duration}</dt><dd><DurationEstimate key={plan.id} plan={plan} ui={ui} /></dd></div>
      <div><dt>{ui.level}</dt><dd>{plan.level}</dd></div>
      <div><dt>{ui.environment}</dt><dd>{plan.environment}</dd></div>
    </dl>
    <section className="support"><h2>{ui.prerequisites}</h2><ul>{plan.prerequisites.map(item => <li key={item}>{item}</li>)}</ul></section>
    <h2 className="section-title">{ui.steps}</h2>
    {stepList(plan.steps)}
    <section className="safety"><h2>{ui.safety}</h2><p>{plan.safetyCopy}</p></section>
    <button disabled={status === 'invalid' || mode.kind !== 'actual'} onClick={() => start()}>{ui.start}</button>
    {sport.id === 'swimming' && <section className="support">
      <label className="affirmation"><input type="checkbox" checked={canSwim} onChange={e => affirm('canSwim', e.target.checked)} />{ui.canSwim}</label>
      <label className="affirmation"><input type="checkbox" checked={safePool} onChange={e => affirm('safePool', e.target.checked)} />{ui.safePool}</label>
      {waterPlan && <section data-water-plan-id={waterPlan.id}><h2>{waterPlan.name}</h2><p className="medium-label">{ui.water}</p><DurationEstimate key={waterPlan.id} plan={waterPlan} ui={ui} /><p>{waterPlan.description}</p><ul>{waterPlan.prerequisites.map(item => <li key={item}>{item}</li>)}</ul>{stepList(waterPlan.steps)}<p className="safety">{waterPlan.safetyCopy}</p></section>}
      <button className="secondary" disabled={!canSwim || !safePool || status === 'invalid' || mode.kind !== 'actual'} onClick={() => start(true)}>{ui.startWater}</button>
      <p>{ui.swimRedirect}</p><a className="button-link secondary" href={routeHash({ screen: 'catalog', profileId: route.profileId, sportId: sport.id, mode: 'classes' })}>{ui.classes}</a></section>}
  </article>;
}
