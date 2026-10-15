import { useApp } from '../state/context';
import { routeHash, type Route } from '../state/navigation';
export default function Chat() {
 const {content,mode,route,command}=useApp();
 if(mode.kind!=='preview'||route.screen!=='chat')return null;
 const chat=content.chats.find(c=>c.id===route.chatId&&c.scenarioId===mode.scenarioId)!;
 const scenario=content.previewScenarios.find(s=>s.id===mode.scenarioId)!;
 const answer=chat.answers.find(a=>a.id===mode.answerId);
 const destination=content.destinations.find(d=>d.id===answer?.destinationId);
 const target:Route|null=!destination?null:destination.kind==='class'?{screen:'detail',profileId:route.profileId,sportId:destination.sportId,mode:'classes',classId:destination.classId}:destination.kind==='plan'?{screen:'plan',profileId:route.profileId,sportId:destination.sportId,mode:'solo',planId:destination.planId}:{screen:'choice',profileId:route.profileId,sportId:destination.sportId};
 return <article data-chat-id={chat.id}>
 <h1 tabIndex={-1}>{scenario.title}</h1><p className="chat-bubble bot">{chat.introduction}</p><p className="chat-prompt">{content.ui.scriptedDisclosure}</p>
 <div className="chat-answers">{chat.answers.map(a=><button className="secondary chat-option" key={a.id} data-answer-id={a.id} aria-pressed={answer?.id===a.id} onClick={()=>command({type:'answer',answerId:a.id})}><span>{a.label}</span><span aria-hidden="true">›</span></button>)}</div>
 {answer&&<section className="chat-result" role="status" data-response-id={answer.id}><p className="chat-bubble me">{answer.label}</p><p className="chat-bubble bot">{answer.response}</p>{destination&&target&&<a className="button-link" data-destination-id={destination.id} href={routeHash(target)}>{destination.label}</a>}</section>}
 </article>;
}
