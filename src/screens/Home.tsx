import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';

export default function Home() {
  const { content, route, envelope } = useApp();
  const profile = content.profiles.find(p => p.id === envelope.preference?.situationId)!;
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
