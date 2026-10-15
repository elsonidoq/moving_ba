import { mockupPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
export default function Notice() {
 const {content,mode,navigate}=useApp();
 const scenario=mode.kind==='preview'?content.previewScenarios.find(s=>s.id===mode.scenarioId&&s.kind==='notice'):undefined;
 if(!scenario)return null;
 return <article data-notice-id={scenario.id} data-preview-scenario={scenario.id}>
 <h1 tabIndex={-1}>{scenario.title}</h1>
 <div className="notice-photo"><img src={mockupPhotos.city_park.src} alt={mockupPhotos.city_park.alt} />
 <button className="notice-card" aria-label={scenario.activationLabel} onClick={()=>navigate({screen:'chat',profileId:scenario.recommendationSituationId,chatId:scenario.chatId!})}>
 <span className="notice-brand"><span aria-hidden="true">◈</span>{content.branding.name}</span>
 <span className="notice-message">{scenario.notice}</span><span className="notice-action">{scenario.activationLabel}<span aria-hidden="true"> ›</span></span>
 </button></div><p className="lead">{scenario.guidance}</p>
 </article>;
}
