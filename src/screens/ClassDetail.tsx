import { useApp } from '../state/context';
import { routeHash, safePlan } from '../state/navigation';
export default function ClassDetail() {
  const { content, route, envelope, interest, status } = useApp();
  if (route.screen !== 'detail') return null;
  const item = content.classes.find(c => c.id === route.classId && c.sportId === route.sportId)!;
  const { ui } = content;
  const sport = content.sports.find(s => s.id === item.sportId)!;
  const interested = !!envelope.profiles[route.profileId].interests[item.id];
  const plan = safePlan(content, route.profileId, route.sportId);
  return <article data-detail-class-id={item.id}>
    <p className="eyebrow">{ui.classes}</p><h1 tabIndex={-1}>{item.title}</h1>
    <p className="safety">{content.legal.fictionalClasses}</p>
    <div className="sport-hero compact"><img src={sport.heroAsset} alt={sport.heroAlt} /></div>
    <p className="lead">{item.description}</p>
    <dl className="class-meta">
      <div><dt>{ui.schedule}</dt><dd>{item.schedule}</dd></div>
      <div><dt>{ui.venue}</dt><dd>{item.venue}</dd></div>
      <div><dt>{ui.locality}</dt><dd>{item.locality}</dd></div>
      <div><dt>{ui.price}</dt><dd>{ui[item.price.kind]}{item.price.kind === 'paid' && ` · ${new Intl.NumberFormat('es-AR', {style: 'currency', currency: item.price.currency, maximumFractionDigits: 0}).format(item.price.amount)} ${item.price.currency}`}</dd></div>
      <div><dt>{ui.level}</dt><dd>{item.level}</dd></div>
      <div><dt>{ui.receiver}</dt><dd>{item.receiver}</dd></div>
    </dl>
    <h2>{ui.requirements}</h2><ul>{item.requirements.map(text => <li key={text}>{text}</li>)}</ul>
    <h2>{ui.contact}</h2><p>{item.contactCopy}</p>
    {!interested ? <button disabled={status === 'invalid'} onClick={interest}>{ui.interest}</button> : <p role="status" className="support">{ui.interestSuccess}</p>}
    <a className="button-link secondary" href={routeHash({screen:'plan',profileId:route.profileId,sportId:route.sportId,mode:'solo',planId:plan.id})}>{ui.solo}</a>
  </article>;
}
