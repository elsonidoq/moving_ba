import { useState, useEffect } from 'react';
import { useApp } from '../state/context';
import { routeHash } from '../state/navigation';
import { selectJourney } from '../state/selectors';
import { SituationForm } from './Onboarding';
export default function Profile() {
 const {content,envelope,route,command}=useApp();const [editing,setEditing]=useState(false);
 useEffect(()=>{document.querySelector<HTMLElement>('main h1')?.focus();},[editing]);
 const journey=selectJourney(content,envelope,route.profileId);
 return <><h1 tabIndex={-1}>{editing?content.onboarding.editTitle:content.ui.profile}</h1>
 {editing?<SituationForm editing onCancel={()=>setEditing(false)} />:<>
 <p>{content.onboarding.choices.find(c=>c.id===envelope.preference?.situationId)?.label}</p>
 <button onClick={()=>setEditing(true)}>{content.ui.editSituation}</button>
 <dl className="journey-stats"><div><dt>{content.ui.sessions}</dt><dd data-stat="sessions">{journey.sessions}</dd></div><div><dt>{content.ui.points}</dt><dd data-stat="points">{journey.points}</dd></div><div><dt>{content.ui.activeWeeks}</dt><dd data-stat="activeWeeks">{journey.activeWeeks}</dd></div></dl>
 <a className="button-link" href={routeHash({screen:'journey',profileId:route.profileId})}>{content.ui.journey}</a>
 <a className="button-link secondary" href={routeHash({screen:'challenges',profileId:route.profileId})}>{content.ui.challenges} · {content.ui.badges} · {content.ui.benefits}</a>
 <button className="secondary" onClick={()=>command({type:'reset',confirmed:window.confirm(content.ui.resetConfirm),entry:'profile'})}>{content.ui.reset}</button>
 </>}
 </>;
}
