import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

export default function Home() {
  const { content, route, envelope } = useApp();
  const profile = content.profiles.find(p => p.id === envelope.preference?.situationId)!;
  const intention = envelope.intention;
  return <>
    <p className="eyebrow">{profile.title}</p>
    <h1 tabIndex={-1}>{profile.welcome}</h1>
    <p className="lead">{profile.subtitle}</p>
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">{profile.cta}</p>
      <h2 id="hero-title">{profile.hero}</h2>
      <p>{profile.nextPrompt}</p>
      <span className="hero-orbit" aria-hidden="true" />
    </section>
    {intention && <section className="support" data-intended-class-id={intention.classId}><h2>{intention.classSnapshot.title}</h2>
      <p>{content.ui.intentionNotice}</p><p>{intention.classSnapshot.schedule}</p><p>{intention.classSnapshot.venue} · {intention.classSnapshot.locality}</p>
      {content.classes.some(c=>c.id===intention.classId&&c.sportId===intention.sportId) ? <a className="button-link secondary" href={routeHash({screen:'detail',profileId:profile.id,sportId:intention.sportId,mode:'classes',classId:intention.classId})}>{content.ui.viewClass}</a> : <p role="status">{content.ui.notAvailable}</p>}
    </section>}
    <h2 className="section-title">{content.ui.chooseSport}</h2>
    <div className="sport-list">
      {content.sports.map(sport => <a key={sport.id} className="sport-card" aria-label={sport.name} data-sport-card={sport.id} href={routeHash({ screen: 'choice', profileId: profile.id, sportId: sport.id })}>
        <img src={sport.heroAsset} alt={sport.heroAlt} />
        <span><strong>{sport.name}</strong><span className="muted">{sport.summary}</span></span>
        <span className="chevron" aria-hidden="true">›</span>
      </a>)}
    </div>
    <p className="support">{content.branding.tagline}</p>
  </>;
}
