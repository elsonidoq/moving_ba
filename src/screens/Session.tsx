import { useState, useEffect } from 'react';
import { publicUrl } from '../content/publicUrl';
import { useApp } from '../state/context';
export default function Session() {
 const {content,attempt,complete,command}=useApp();const [failed,setFailed]=useState(false);
 const step=attempt?.steps[attempt.viewIndex];
 useEffect(()=>setFailed(false),[step?.id,attempt?.attemptId]);
 if(!attempt||attempt.status!=='active'||!step)return null;
 const reviewing=attempt.viewIndex<attempt.acceptedCount;
 return <article data-attempt-id={attempt.attemptId} data-current-step-id={step.id} data-accepted-count={attempt.acceptedCount} data-view-index={attempt.viewIndex}>
 <p className="eyebrow">{attempt.planTitle}</p><h1 tabIndex={-1}>{step.exercise.title}</h1>
 <p>{content.ui.stepProgress} {attempt.viewIndex+1} / {attempt.steps.length}</p><progress value={attempt.acceptedCount} max={attempt.steps.length} aria-label={content.ui.stepProgress}/>
 {step.image?.path&&!failed?<figure className="exercise-photo"><img src={publicUrl(step.image.path)} alt={step.image.alt} onError={()=>setFailed(true)}/><figcaption>{step.image.attribution}</figcaption></figure>:<p role="status" className="support">{content.ui.imageUnavailable}</p>}
 <p className="quantity">{step.exercise.quantity}</p><p>{step.exercise.technique}</p>
 {attempt.sportId==='swimming'&&<p className="medium-label">{content.ui[attempt.medium==='water'?'water':'dryLand']}</p>}
 <p className="safety">{content.legal.illustrativeTraining}</p>
 <div className="review-controls"><button className="secondary" disabled={attempt.viewIndex===0} onClick={()=>command({type:'review',attemptId:attempt.attemptId,direction:'previous'})}>{content.ui.previous}</button><button className="secondary" disabled={!reviewing} onClick={()=>command({type:'review',attemptId:attempt.attemptId,direction:'next'})}>{content.ui.reviewNext}</button></div>
 <button disabled={reviewing} onClick={()=>complete(attempt.attemptId,step.id)}>{content.ui.completeStep}</button>
 </article>;
}
