import { publicUrl } from '../content/publicUrl';
import { mockupPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
export default function Notice() {
 const {content,mode,navigate}=useApp();
 const scenario=mode.kind==='preview'?content.previewScenarios.find(s=>s.id===mode.scenarioId&&s.kind==='notice'):undefined;
 if(!scenario)return null;
 return <article data-notice-id={scenario.id} data-preview-scenario={scenario.id}>
 <h1 className="visually-hidden" tabIndex={-1}>{scenario.title}</h1>
 <div className="notice-photo"><img src={publicUrl(mockupPhotos.city_park.src)} alt="" />
 <div className="notice-time" aria-hidden="true"><strong>9:41</strong><span>Buenos Aires</span></div>
 <button className="notice-card" aria-label={scenario.activationLabel} aria-describedby={`notice-message-${scenario.id}`} onClick={()=>navigate({screen:'chat',profileId:scenario.recommendationSituationId,chatId:scenario.chatId!})}>
 <span className="notice-brand"><span aria-hidden="true">◈</span>{content.branding.name}</span>
 <span className="notice-message" id={`notice-message-${scenario.id}`}>{scenario.notice}</span><span className="notice-action">{scenario.activationLabel}<span aria-hidden="true"> ›</span></span>
 </button></div><p className="visually-hidden">{scenario.guidance}</p>
 </article>;
}
