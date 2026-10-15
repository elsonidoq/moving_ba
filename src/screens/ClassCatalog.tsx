import { sportPhotos, classPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

export default function ClassCatalog() {
  const { content, route } = useApp();
  if (route.screen !== 'catalog' && route.screen !== 'classes') return null;
  const sport = content.sports.find(s => s.id === route.sportId);
  const { ui } = content;
  return <>
    <p className="eyebrow">{sport?.name ?? ui.classes}</p>
    <h1 tabIndex={-1}>{ui.classCatalog}</h1>
    {sport && <div className="sport-hero compact"><img src={sportPhotos[sport.id].hero.src} alt={sportPhotos[sport.id].hero.alt} /></div>}
    {route.screen === 'classes' && <nav className="class-filters" aria-label={ui.chooseSport}><a href="#/classes" aria-current={!sport?'page':undefined}>{ui.classes}</a>{content.sports.map(s=><a key={s.id} href={routeHash({screen:'classes',profileId:route.profileId,sportId:s.id})} aria-current={sport?.id===s.id?'page':undefined}>{s.name}</a>)}</nav>}
    <div className="class-list">
      {content.classes.filter(item => !sport || item.sportId === sport.id).map(item => <article key={item.id} className="class-card" data-class-id={item.id}>
        {classPhotos[item.id] ? <img className="class-photo" src={classPhotos[item.id].src} alt={classPhotos[item.id].alt} /> : <p className="muted">{ui.imageUnavailable}</p>}
        <span className={`price-tag ${item.price.kind}`}>{ui[item.price.kind]}{` · ${new Intl.NumberFormat('es-AR', {style: 'currency', currency: item.price.currency, maximumFractionDigits: 0}).format(item.price.amount)} ${item.price.currency}`}</span>
        <h2>{item.title}</h2><p>{item.description}</p>
        <dl className="class-meta">
          <div><dt>{ui.schedule}</dt><dd>{item.schedule}</dd></div>
          <div><dt>{ui.venue}</dt><dd>{item.venue}</dd></div>
          <div><dt>{ui.locality}</dt><dd>{item.locality}</dd></div>
          <div><dt>{ui.level}</dt><dd>{item.level}</dd></div>
        </dl>
        <h3>{ui.requirements}</h3><ul>{item.requirements.map(text => <li key={text}>{text}</li>)}</ul>
        <p className="muted">{item.contactCopy}</p>
        <a className="button-link" href={routeHash({screen:'detail',profileId:route.profileId,sportId:item.sportId,mode:'classes',classId:item.id})}>{ui.viewClass}</a>
      </article>)}
    </div>
    <p className="support">{content.legal.locationNotice}</p>
  </>;
}
