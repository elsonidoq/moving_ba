import { welcomePhoto } from '../content/mockupPhotos';
import { useEffect, useState } from 'react';
import type { ProfileId } from '../content/types';
import { useApp } from '../state/context';
export function SituationForm({editing=false,onCancel}:{editing?:boolean;onCancel?:()=>void}) {
 const {content,envelope,command}=useApp();
 const [selected,setSelected]=useState<ProfileId | null>(editing?envelope.preference?.situationId??null:null);
 const copy=content.onboarding;
 return <form onSubmit={e=>{e.preventDefault();if(selected)command({type:editing?'editSituation':'chooseSituation',situationId:selected});if(editing)onCancel?.();}}>
   <fieldset><legend>{editing?copy.editInstructions:copy.instructions}</legend>
   {copy.choices.map(c=><label className="situation-option" key={c.id}><input type="radio" name="situation" value={c.id} checked={selected===c.id} onChange={()=>setSelected(c.id)} />{c.label}</label>)}
   </fieldset>
   {!selected&&<p role="status">{copy.validationLabel}</p>}
   <button disabled={!selected} type="submit">{copy.continueLabel}</button>
   {editing&&<button type="button" className="secondary" onClick={onCancel}>{content.ui.cancel}</button>}
 </form>;
}
export default function Onboarding() {
 const {content,route,command}=useApp();const recovery=route.screen==='recovery';
 const [selecting,setSelecting]=useState(false);
 useEffect(()=>setSelecting(false),[route]);
 useEffect(()=>{const heading=document.querySelector<HTMLElement>('main h1');heading?.focus({preventScroll:true});heading?.scrollIntoView({block:'start'});},[selecting,recovery]);
 if(recovery)return <><h1 tabIndex={-1}>{content.ui.storageRecovery}</h1><button onClick={()=>command({type:'reset',confirmed:window.confirm(content.ui.resetConfirm),entry:'recovery'})}>{content.ui.storageReset}</button></>;
 return selecting?<><h1 tabIndex={-1}>{content.onboarding.title}</h1><SituationForm /><button type="button" className="secondary" onClick={()=>setSelecting(false)}>{content.ui.back}</button></>:<>
  <img className="city-hero" src={welcomePhoto.src} alt={welcomePhoto.alt} />
  <h1 tabIndex={-1}>{content.branding.name}</h1><p className="lead">{content.branding.tagline}</p>
  <button className="welcome-start" onClick={()=>setSelecting(true)}>{content.onboarding.startLabel}</button>
 </>;
}
