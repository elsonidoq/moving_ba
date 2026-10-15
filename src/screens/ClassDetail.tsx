import { classPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
import { routeHash, safePlan } from '../state/navigation';
export default function ClassDetail() {
  const { content, route, envelope, interest, status, command, mode } = useApp();
  if (route.screen !== 'detail') return null;
  const item = content.classes.find(c => c.id === route.classId && c.sportId === route.sportId)!;
  const { ui } = content;
  const interested = Object.values(envelope.interests).some(i=>i.classId===item.id);
  const plan = safePlan(content, route.profileId, route.sportId);
  return <article data-detail-class-id={item.id}>
    <p className="eyebrow">{ui.classes}</p><h1 tabIndex={-1}>{item.title}</h1>
    <p className="safety">{content.legal.fictionalClasses}</p>
    {classPhotos[item.id] ? <div className="sport-hero compact"><img src={classPhotos[item.id].src} alt={classPhotos[item.id].alt} /></div> : <p className="muted">{ui.imageUnavailable}</p>}
    <p className="lead">{item.description}</p>
    <dl className="class-meta">
      <div><dt>{ui.schedule}</dt><dd>{item.schedule}</dd></div>
      <div><dt>{ui.venue}</dt><dd>{item.venue}</dd></div>
      <div><dt>{ui.locality}</dt><dd>{item.locality}</dd></div>
      <div><dt>{ui.price}</dt><dd>{ui[item.price.kind]}{` · ${new Intl.NumberFormat('es-AR', {style: 'currency', currency: item.price.currency, maximumFractionDigits: 0}).format(item.price.amount)} ${item.price.currency}`}</dd></div>
      <div><dt>{ui.level}</dt><dd>{item.level}</dd></div>
      <div><dt>{ui.receiver}</dt><dd>{item.receiver}</dd></div>
    </dl>
    <h2>{ui.requirements}</h2><ul>{item.requirements.map(text => <li key={text}>{text}</li>)}</ul>
    <h2>{ui.contact}</h2><p>{item.contactCopy}</p>
    {!interested ? <button disabled={status === 'invalid' || mode.kind !== 'actual'} onClick={interest}>{ui.interest}</button> : <p role="status" className="support">{ui.interestSuccess}</p>}
    <p className="support">{ui.locationIllustration}</p><p>{ui.intentionNotice}</p>
    <button disabled={status === 'invalid' || mode.kind !== 'actual'} onClick={()=>command({type:'intention',classId:item.id})}>{ui.intention}</button>
    {envelope.intention?.classId === item.id && <p role="status">{ui.intentionNotice}</p>}
    <a className="button-link secondary" href={routeHash({screen:'plan',profileId:route.profileId,sportId:route.sportId,mode:'solo',planId:plan.id})}>{ui.solo}</a>
  </article>;
}
