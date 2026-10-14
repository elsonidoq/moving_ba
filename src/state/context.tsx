import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Content, ProfileId } from '../content/types';
import { guardHash, routeHash, type Route } from './navigation';
import { completeStep, startSession, type Attempt } from './session';
import { legacyView, loadEnvelope, registerInterest, resetEnvelope, saveEnvelope, setIntention, storageKey, type Envelope, type LegacyEnvelope, type Loaded } from './storage';

export type Runtime = Loaded & {
  route: Route; attempt: Attempt | null; canSwim: boolean; safePool: boolean;
  mode: {kind:'actual'} | {kind:'preview';scenarioId:string;answerId?:string};
  message: string | null;
};
export type Command =
  | {type:'chooseSituation' | 'editSituation';situationId:ProfileId}
  | {type:'interest' | 'intention';classId:string}
  | {type:'navigate';hash:string}
  | {type:'affirm';key:'canSwim' | 'safePool';value:boolean}
  | {type:'start';planId:string}
  | {type:'accept';attemptId:string;stepId:string}
  | {type:'enterScenario';scenarioId:string}
  | {type:'answer';answerId:string}
  | {type:'exitPreview'}
  | {type:'reset';confirmed:boolean;entry:'profile' | 'recovery'}
  | {type:'storageEvent';key:string | null};
const cleared = {attempt:null,canSwim:false,safePool:false,mode:{kind:'actual' as const}};
function landing(e: Envelope, invalid = false): Route {
  return {screen:invalid ? 'recovery' : e.preference ? 'home' : 'onboarding',profileId:e.preference?.situationId ?? 'first'};
}
/** Synchronous production owner shared by React and helper tests; all commands read the current state. */
export function createCommandOwner(content: Content, port: Parameters<typeof loadEnvelope>[1], hash = '', clock = () => new Date(), uuid = () => crypto.randomUUID()) {
  const loaded = loadEnvelope(content,port);
  let state: Runtime = {...loaded,...cleared,message:loaded.status === 'unavailable' ? content.ui.storageWarning + ' Los datos guardados anteriormente pueden volver al recargar.' : null,route:loaded.status === 'invalid' ? landing(loaded.envelope,true) : guardHash(hash,content,{attempt:null,envelope:loaded.envelope})};
  const persist = (envelope: Envelope) => {
    if (envelope === state.envelope) return;
    const status = saveEnvelope(envelope,port,state);
    state = {...state,envelope,status,message:status === 'unavailable' ? content.ui.storageWarning + ' Los datos guardados anteriormente pueden volver al recargar.' : null};
  };
  const canAct = () => state.mode.kind === 'actual' && state.status !== 'invalid' && !!state.envelope.preference;
  return {
    getState: () => state,
    dispatch(command: Command): boolean {
      const before = state;
      if (command.type === 'storageEvent') {
        if (command.key !== storageKey && command.key !== null) return false;
        // Invalidation precedes the read, including synchronous observable storage ports.
        state = {...state,...cleared};
        const next = loadEnvelope(content,port);
        state = {...state,...next,route:landing(next.envelope,next.status === 'invalid'),message:next.status === 'unavailable' ? content.ui.storageWarning + ' Los datos guardados anteriormente pueden volver al recargar.' : null};
      } else if (command.type === 'reset') {
        if (!command.confirmed || state.mode.kind !== 'actual') return false;
        const next = resetEnvelope(port,true)!;
        state = {...next,...cleared,route:landing(next.envelope),message:next.status === 'ready' ? null : content.ui.resetFailed};
      } else if (command.type === 'exitPreview') {
        if (state.mode.kind !== 'preview') return false;
        state = {...state,...cleared,route:landing(state.envelope)};
      } else if (command.type === 'enterScenario') {
        const scenario = content.previewScenarios.find(s => s.id === command.scenarioId);
        if (!canAct() || !scenario) return false;
        state = {...state,...cleared,mode:{kind:'preview',scenarioId:scenario.id},route:{screen:'home',profileId:scenario.recommendationSituationId}};
      } else if (command.type === 'answer') {
        if (state.mode.kind !== 'preview') return false;
        const scenario = content.previewScenarios.find(s => s.id === (state.mode.kind === 'preview' ? state.mode.scenarioId : ''))!;
        const answer = content.chats.find(c => c.id === scenario.chatId)?.answers.find(a => a.id === command.answerId);
        if (!answer) return false;
        state = {...state,mode:{...state.mode,answerId:answer.id}};
      } else if (command.type === 'navigate') {
        const route = state.status === 'invalid' ? landing(state.envelope,true) : guardHash(command.hash,content,state);
        state = {...state,route,attempt:null,canSwim:false,safePool:false};
      } else if (command.type === 'chooseSituation' || command.type === 'editSituation') {
        if (state.mode.kind !== 'actual' || state.status === 'invalid' || !content.profiles.some(p => p.id === command.situationId) || (command.type === 'editSituation' && !state.envelope.preference)) return false;
        if (state.envelope.preference?.situationId === command.situationId) return false;
        persist({...state.envelope,preference:{situationId:command.situationId,confirmed:true}});
        state = {...state,route:landing(state.envelope)};
      } else {
        if (!canAct()) return false;
        const profileId = state.envelope.preference!.situationId;
        if (command.type === 'interest') {
          const item = content.classes.find(c => c.id === command.classId);
          if (!item) return false;
          persist(registerInterest(state.envelope,content,profileId,item.sportId,item.id,clock()));
        } else if (command.type === 'intention') persist(setIntention(state.envelope,content,command.classId,clock()));
        else if (command.type === 'affirm') state = {...state,[command.key]:command.value};
        else if (command.type === 'start') {
          const plan = content.plans.find(p => p.id === command.planId && p.profileId === profileId);
          if (!plan) return false;
          const attempt = startSession(content,{profileId,sportId:plan.sportId,planId:plan.id,canSwim:state.canSwim,safePool:state.safePool},uuid);
          if (!attempt) return false;
          state = {...state,attempt,route:{screen:'session',profileId,sportId:plan.sportId,planId:plan.id,attemptId:attempt.attemptId}};
        } else if (command.type === 'accept') {
          if (state.route.screen !== 'session') return false;
          const result = completeStep(state.attempt,state.envelope,command.attemptId,command.stepId,clock());
          if (result.attempt === state.attempt) return false;
          state = {...state,attempt:result.attempt}; persist(result.envelope);
          if (result.attempt?.status === 'completed') state = {...state,canSwim:false,safePool:false,route:{screen:'success',profileId,sportId:result.attempt.sportId,attemptId:command.attemptId}};
        }
      }
      return state !== before;
    },
  };
}
type Owner = ReturnType<typeof createCommandOwner>;
type AppState = Omit<Runtime,'envelope'> & {envelope:Envelope & {profiles:LegacyEnvelope['profiles']};content:Content;navigate:(r:Route)=>void;affirm:(key:'canSwim'|'safePool',v:boolean)=>void;start:(water?:boolean)=>void;complete:(id:string,step:string)=>void;recover:()=>void;interest:()=>void;commands:Owner;command:(command:Command)=>void};
const AppContext = createContext<AppState | null>(null);
const browserStorage = {getItem:(k:string)=>window.localStorage.getItem(k),setItem:(k:string,v:string)=>window.localStorage.setItem(k,v)};
export function AppProvider({content,children}:{content:Content;children:ReactNode}) {
  const ref = useRef<Owner | null>(null);
  if (!ref.current) ref.current = createCommandOwner(content,browserStorage,window.location.hash);
  const commands = ref.current;
  const [state,setState] = useState(commands.getState());
  const dispatch = (command:Command, replace = false) => {
    commands.dispatch(command);
    const next = commands.getState(); setState(next);
    const hash = routeHash(next.route);
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState(null,'',hash);
      else window.history.pushState(null,'',hash);
    }
  };
  useEffect(() => {
    window.history.replaceState(null,'',routeHash(commands.getState().route));
    const sync = () => dispatch({type:'navigate',hash:window.location.hash},true);
    const reload = (e:StorageEvent) => dispatch({type:'storageEvent',key:e.key},true);
    window.addEventListener('hashchange',sync);window.addEventListener('storage',reload);
    return () => {window.removeEventListener('hashchange',sync);window.removeEventListener('storage',reload);};
  },[commands]);
  return <AppContext.Provider value={{...state,envelope:{...state.envelope,profiles:legacyView(state.envelope).profiles},content,commands,command:dispatch,
    navigate:r=>dispatch({type:'navigate',hash:routeHash(r)}),affirm:(key,value)=>dispatch({type:'affirm',key,value}),
    start:(water=false)=>{const s=commands.getState();if(s.route.screen!=='plan'||(water&&s.route.sportId!=='swimming'))return;const planId=water?content.plans.find(p=>p.profileId===s.envelope.preference?.situationId&&p.sportId==='swimming'&&p.medium==='water')?.id:s.route.planId;if(planId)dispatch({type:'start',planId});},
    complete:(attemptId,stepId)=>dispatch({type:'accept',attemptId,stepId}),recover:()=>dispatch({type:'reset',confirmed:true,entry:state.status==='invalid'?'recovery':'profile'}),
    interest:()=>{const r=commands.getState().route;if(r.screen==='detail')dispatch({type:'interest',classId:r.classId});},
  }}>{children}</AppContext.Provider>;
}
export function useApp() {const context=useContext(AppContext);if(!context)throw new Error('AppProvider is required');return context;}
