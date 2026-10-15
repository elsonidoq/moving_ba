import { useState } from 'react';
import { mockupPhotos, sportPhotos } from '../content/mockupPhotos';
import { useApp } from '../state/context';
import { selectPreviewJourney } from '../state/selectors';
import { routeHash } from '../state/navigation';

export default function Home() {
  const [photoFailed, setPhotoFailed] = useState(false);
  const { content, route, envelope, mode } = useApp();
  const scenario = mode.kind === 'preview' ? content.previewScenarios.find(s=>s.id===mode.scenarioId) : undefined;
  const preview = scenario ? selectPreviewJourney(content,scenario.id)! : null;
  const profile = content.profiles.find(p => p.id === route.profileId)!;
  const intention = mode.kind === 'actual' ? envelope.intention : null;
  return <>
    {scenario && <section data-preview-scenario={scenario.id} className="support scenario-support"><h2><span aria-hidden="true">↗ </span>{content.ui.next}</h2><p>{scenario.guidance}</p><dl className="journey-stats"><div><dt>{content.ui.sessions}</dt><dd data-stat="sessions">{preview!.sessions}</dd></div><div><dt>{content.ui.activeWeeks}</dt><dd>{preview!.activeWeeks}</dd></div><div><dt>{content.ui.points}</dt><dd>{preview!.points}</dd></div></dl></section>}
    <p className="eyebrow">{profile.title}</p>
    <h1 tabIndex={-1}>{profile.welcome}</h1>
    <p className="lead">{profile.subtitle}</p>
    <section className="hero home-hero" aria-labelledby="hero-title">
      {!photoFailed ? <img src={mockupPhotos.city_park.src} alt={mockupPhotos.city_park.alt} onError={()=>setPhotoFailed(true)} /> : <p role="status">{content.ui.imageUnavailable}</p>}
      <div className="home-hero-copy"><p className="eyebrow">{profile.cta}</p>
      <h2 id="hero-title">{profile.hero}</h2>
      <p>{profile.nextPrompt}</p>
      </div>
    </section>
    {intention && <section className="support" data-intended-class-id={intention.classId}><h2>{intention.classSnapshot.title}</h2>
      <p>{content.ui.intentionNotice}</p><p>{intention.classSnapshot.schedule}</p><p>{intention.classSnapshot.venue} · {intention.classSnapshot.locality}</p>
      {content.classes.some(c=>c.id===intention.classId&&c.sportId===intention.sportId) ? <a className="button-link secondary" href={routeHash({screen:'detail',profileId:profile.id,sportId:intention.sportId,mode:'classes',classId:intention.classId})}>{content.ui.viewClass}</a> : <p role="status">{content.ui.notAvailable}</p>}
    </section>}
    <h2 className="section-title">{content.ui.chooseSport}</h2>
    <div className="sport-list">
      {content.sports.map(sport => <a key={sport.id} className="sport-card" aria-label={sport.name} data-sport-card={sport.id} href={routeHash({ screen: 'choice', profileId: profile.id, sportId: sport.id })}>
        <img src={sportPhotos[sport.id].card.src} alt={sportPhotos[sport.id].card.alt} />
        <span><strong>{sport.name}</strong><span className="muted">{sport.summary}</span></span>
        <span className="chevron" aria-hidden="true">›</span>
      </a>)}
    </div>
    <p className="support">{content.branding.tagline}</p>
  </>;
}
