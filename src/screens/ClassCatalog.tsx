import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

export default function ClassCatalog() {
  const { content, route } = useApp();
  if (route.screen !== 'catalog') return null;
  const sport = content.sports.find(s => s.id === route.sportId)!;
  const { ui } = content;
  return <>
    <p className="eyebrow">{sport.name}</p>
    <h1 tabIndex={-1}>{ui.classCatalog}</h1>
    <div className="sport-hero compact"><img src={sport.heroAsset} alt={sport.heroAlt} /></div>
    <p className="safety">{content.legal.fictionalClasses}</p>
    <div className="class-list">
      {content.classes.filter(item => item.sportId === sport.id).map(item => <article key={item.id} className="class-card" data-class-id={item.id}>
        <span className={`price-tag ${item.price.kind}`}>{ui[item.price.kind]}{item.price.kind === 'paid' && ` · ${new Intl.NumberFormat('es-AR', {style: 'currency', currency: item.price.currency, maximumFractionDigits: 0}).format(item.price.amount)} ${item.price.currency}`}</span>
        <h2>{item.title}</h2><p>{item.description}</p>
        <dl className="class-meta">
          <div><dt>{ui.schedule}</dt><dd>{item.schedule}</dd></div>
          <div><dt>{ui.venue}</dt><dd>{item.venue}</dd></div>
          <div><dt>{ui.locality}</dt><dd>{item.locality}</dd></div>
          <div><dt>{ui.level}</dt><dd>{item.level}</dd></div>
          <div><dt>{ui.receiver}</dt><dd>{item.receiver}</dd></div>
        </dl>
        <h3>{ui.requirements}</h3><ul>{item.requirements.map(text => <li key={text}>{text}</li>)}</ul>
        <p className="muted">{item.contactCopy}</p>
        <a className="button-link" href={routeHash({screen:'detail',profileId:route.profileId,sportId:sport.id,mode:'classes',classId:item.id})}>{ui.viewClass}</a>
      </article>)}
    </div>
    <p className="support">{content.legal.locationNotice}</p>
  </>;
}
