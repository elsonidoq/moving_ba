import { sportPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';
export default function Sports(){
 const {content,route}=useApp();
 return <><h1 tabIndex={-1}>{content.ui.sports}</h1><p className="lead">{content.ui.chooseSport}</p>
 <div className="sport-list">{content.sports.map(s=><a className="sport-card" key={s.id} href={routeHash({screen:'choice',profileId:route.profileId,sportId:s.id})}><img src={sportPhotos[s.id].card.src} alt={sportPhotos[s.id].card.alt}/><span><strong>{s.name}</strong><span className="muted">{s.summary}</span></span></a>)}</div></>;
}
