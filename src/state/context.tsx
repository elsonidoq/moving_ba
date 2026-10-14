import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Content } from '../content/types';
import { guardHash, routeHash, type Route } from './navigation';

type AppState = { content: Content; route: Route; navigate: (route: Route) => void };
const AppContext = createContext<AppState | null>(null);

export function AppProvider({ content, children }: { content: Content; children: ReactNode }) {
  const [route, setRoute] = useState(() => guardHash(window.location.hash, content));
  useEffect(() => {
    const sync = () => {
      const next = guardHash(window.location.hash, content);
      const canonical = routeHash(next);
      if (window.location.hash !== canonical) window.history.replaceState(null, '', canonical);
      setRoute(next);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [content]);
  const navigate = (next: Route) => { window.location.hash = routeHash(next); };
  return <AppContext.Provider value={{ content, route, navigate }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('AppProvider is required');
  return context;
}
