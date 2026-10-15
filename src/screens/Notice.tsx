import { useApp } from '../state/context';
export default function Notice() {
 const {content,mode}=useApp();
 const scenario=mode.kind==='preview'?content.previewScenarios.find(s=>s.id===mode.scenarioId&&s.kind==='notice'):undefined;
 if(!scenario)return null;
 return <article data-notice-id={scenario.id} data-preview-scenario={scenario.id}><h1 tabIndex={-1}>{scenario.title}</h1><p className="hero">{scenario.notice}</p><p>{scenario.guidance}</p><p>{scenario.disclosure}</p><p>{content.ui.scriptedDisclosure}</p></article>;
}
