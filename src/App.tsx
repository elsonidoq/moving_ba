import { useEffect, useState } from 'react';
import type { Content } from './content/types';
import { loadContent } from './content/load';
import { AppProvider, useApp } from './state/context';
import AppShell from './components/AppShell';
import Home from './screens/Home';
import Onboarding from './screens/Onboarding';
import Profile from './screens/Profile';
import Sports from './screens/Sports';
import SportChoice from './screens/SportChoice';
import Plan from './screens/Plan';
import ClassCatalog from './screens/ClassCatalog';
import Session from './screens/Session';
import Success from './screens/Success';
import ClassDetail from './screens/ClassDetail';
import Journey from './screens/Journey';
import Challenges from './screens/Challenges';

type Bootstrap = { status: 'loading' } | { status: 'ready'; content: Content } | { status: 'error'; hint: string };

function Screens() {
  const { route } = useApp();
  return <AppShell>{route.screen === 'onboarding' || route.screen === 'recovery' ? <Onboarding /> : route.screen === 'profile' ? <Profile /> : route.screen === 'sports' ? <Sports /> : route.screen === 'classes' ? <ClassCatalog /> : route.screen === 'home' ? <Home /> : route.screen === 'choice' ? <SportChoice /> : route.screen === 'plan' ? <Plan /> : route.screen === 'session' ? <Session /> : route.screen === 'success' ? <Success /> : route.screen === 'detail' ? <ClassDetail /> : route.screen === 'journey' ? <Journey /> : route.screen === 'challenges' ? <Challenges /> : <ClassCatalog />}</AppShell>;
}

export default function App() {
  const [state, setState] = useState<Bootstrap>({ status: 'loading' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading' });
    loadContent(controller.signal).then(content => {
      if (!controller.signal.aborted) setState({ status: 'ready', content });
    }).catch(error => {
      if (!controller.signal.aborted) setState({ status: 'error', hint: error.message });
    });
    return () => controller.abort();
  }, [retry]);
  if (state.status === 'ready') return <AppProvider content={state.content}><Screens /></AppProvider>;
  // The bootstrap shell must work when the public file itself cannot be read.
  return <main className="app bootstrap" aria-busy={state.status === 'loading'}>
    {state.status === 'loading' ? <p role="status">Estamos cargando el contenido…</p> : <section role="alert">
      <h1>No pudimos cargar el contenido.</h1>
      <p>Revisá la configuración e intentá de nuevo.</p><p>{state.hint}</p>
      <button onClick={() => setRetry(value => value + 1)}>Intentar de nuevo</button>
    </section>}
  </main>;
}
