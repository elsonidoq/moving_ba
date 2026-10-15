import { useEffect, useRef, type ReactNode } from 'react';
import { useApp } from '../state/context';
import { guardHash, routeHash, type Route } from '../state/navigation';
export default function AppShell({children}:{children:ReactNode}) {
 const {content,route,navigate,status,attempt,envelope,message,parent,mode,command}=useApp();const main=useRef<HTMLElement>(null);const {ui}=content;
 const hidden=route.screen==='onboarding'||route.screen==='recovery'||route.screen==='notice';
 let back:Route={screen:'home',profileId:route.profileId};
 if(route.screen==='journey'||route.screen==='challenges')back={screen:'profile',profileId:route.profileId};
 if(route.screen==='choice')back={screen:'sports',profileId:route.profileId};
 if(route.screen==='detail')back=parent && (parent.screen==='classes'||parent.screen==='catalog') ? parent : {screen:'catalog',profileId:route.profileId,sportId:route.sportId,mode:'classes'};
 if(route.screen==='plan'||route.screen==='catalog')back={screen:'choice',profileId:route.profileId,sportId:route.sportId};
 if(route.screen==='session')back={screen:'plan',profileId:route.profileId,sportId:route.sportId,mode:'solo',planId:route.planId};
 useEffect(()=>{main.current?.querySelector<HTMLElement>('h1')?.focus();},[route,attempt?.viewIndex]);
 return <div className="app" onClickCapture={e=>{const hash=(e.target as HTMLElement).closest('a')?.getAttribute('href');if(hash?.startsWith('#/')){e.preventDefault();navigate(guardHash(hash,content,{attempt,envelope,mode}));}}}>
 <button className="skip-link" onClick={()=>main.current?.focus()}>{ui.skipToContent}</button>
 <header className="app-header"><a className="brand" href="#/home"><span className="brand-mark" aria-hidden="true">BA</span><span>{content.branding.name}</span></a>
 {!hidden&&<a className="profile-button" aria-label={ui.profileAccessibleName} href="#/profile"><span aria-hidden="true">●</span></a>}
 <p className="demo-notice">{content.branding.demoNotice}</p></header>
 {!hidden&&route.screen!=='home'&&<nav className="breadcrumbs" aria-label={ui.back}><a href={routeHash(back)}><span aria-hidden="true">← </span>{ui.back}</a></nav>}
 {status==='unavailable'&&<p role="alert" className="safety">{message??ui.storageWarning}</p>}
 <main ref={main} id="main-content" tabIndex={-1} data-profile-id={route.profileId} data-sport-id={'sportId' in route?route.sportId:undefined} data-mode={'mode' in route?route.mode:undefined}>{mode.kind==='preview'&&<p className="preview-badge" data-preview-badge>{ui.previewBadge}</p>}<div data-preview-content>{children}</div>{mode.kind==='preview'&&<section data-preview-exit><p>{ui.previewBadge} · {content.ui.exitPreview}</p><button onClick={()=>command({type:'exitPreview'})}>{ui.exitPreview}</button></section>}</main>
 <footer><p>{content.legal.illustrativeTraining}</p><p>{content.legal.professionalReview}</p><p>{content.legal.noOfficialStatus}</p></footer>
 {!hidden&&<nav className="bottom-tabs" aria-label="Principal">{(['home','sports','classes'] as const).map(screen=><a key={screen} aria-current={route.screen===screen?'page':undefined} href={routeHash({screen,profileId:route.profileId})}>{ui[screen]}</a>)}</nav>}
 </div>;
}
