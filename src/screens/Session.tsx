import { useApp } from '../state/context';
export default function Session() {
  const { content, attempt, complete } = useApp();
  if (!attempt || attempt.status !== 'active') return null;
  const step = attempt.steps[attempt.cursor];
  return <article data-attempt-id={attempt.attemptId} data-current-step-id={step.id}>
    <p className="eyebrow">{attempt.planTitle}</p>
    <h1 tabIndex={-1}>{step.exercise.title}</h1>
    <p>{content.ui.stepProgress} {attempt.cursor + 1} / {attempt.steps.length}</p>
    <progress value={attempt.cursor} max={attempt.steps.length} aria-label={content.ui.stepProgress} />
    <div className="sport-hero compact"><img src={step.exercise.imageAsset} alt={step.exercise.imageAlt} /></div>
    <p className="quantity">{step.exercise.quantity}</p><p>{step.exercise.technique}</p>
    {attempt.sportId === 'swimming' && <p className="medium-label">{content.ui[attempt.medium === 'water' ? 'water' : 'dryLand']}</p>}
    <p className="safety">{content.legal.illustrativeTraining}</p>
    <button onClick={() => complete(attempt.attemptId, step.id)}>{content.ui.completeStep}</button>
  </article>;
}
