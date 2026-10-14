import { useEffect, useRef, type ReactNode } from 'react';
import { useApp } from '../state/context';
import { guardHash, routeHash } from '../state/navigation';
import type { ProfileId } from '../content/types';

export default function AppShell({ children }: { children: ReactNode }) {
  const { content, route, navigate, status, recover, attempt, envelope } = useApp();
  const main = useRef<HTMLElement>(null);
  const { ui } = content;
  const back = route.screen === 'plan' || route.screen === 'catalog'
    ? { screen: 'choice' as const, profileId: route.profileId, sportId: route.sportId }
    : { screen: 'home' as const, profileId: route.profileId };
  useEffect(() => {
    main.current?.querySelector<HTMLElement>('h1')?.focus();
  }, [route.screen, route.profileId, 'sportId' in route ? route.sportId : null]);
  return <div className="app" onClickCapture={event => {
    const link = (event.target as HTMLElement).closest('a');
    const hash = link?.getAttribute('href');
    if (hash?.startsWith('#/')) { event.preventDefault(); navigate(guardHash(hash, content, { attempt, envelope })); }
  }}>
    <button className="skip-link" onClick={() => main.current?.focus()}>{ui.skipToContent}</button>
    <header className="app-header">
      <a className="brand" href={routeHash({ screen: 'home', profileId: route.profileId })}>
        <span className="brand-mark" aria-hidden="true">{content.branding.name.split(' ')[0]}</span>
        <span>{content.branding.name}</span>
      </a>
      <p className="demo-notice">{content.branding.demoNotice}</p>
    </header>
    <div className="profile-control">
      <label htmlFor="profile">{ui.profile}</label>
      <select id="profile" value={route.profileId} onChange={event => navigate({ screen: 'home', profileId: event.target.value as ProfileId })}>
        {content.profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.title}</option>)}
      </select>
    </div>
    {route.screen !== 'home' && <nav className="breadcrumbs" aria-label={ui.back}>
      <a href={routeHash(back)}><span aria-hidden="true">← </span>{ui.back}</a>
      <a href={routeHash({ screen: 'home', profileId: route.profileId })}>{ui.home}</a>
    </nav>}
    {status !== 'ready' && <section role="alert" className="safety"><p>{status === 'invalid' ? ui.storageRecovery : ui.storageWarning}</p><button onClick={recover}>{ui.storageRecovery}</button></section>}
    <main id="main-content" tabIndex={-1} ref={main} data-profile-id={route.profileId} data-sport-id={'sportId' in route ? route.sportId : undefined} data-mode={'mode' in route ? route.mode : undefined}>{children}</main>
    <footer>
      <p>{content.legal.illustrativeTraining}</p>
      <p>{content.legal.professionalReview}</p>
      <p>{content.legal.noOfficialStatus}</p>
    </footer>
  </div>;
}
