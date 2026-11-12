import { useEffect, useState } from 'react';
import MathApp from '@/game/MathApp';
import LettersApp from '@/letters/LettersApp';
import PairsApp from '@/pairs/PairsApp';
import HomePage from '@/site/HomePage';

const routeFrom = (): 'site' | 'math' | 'letters' | 'pairs' => {
  const hash = window.location.hash;
  if (hash.startsWith('#/games/letters')) return 'letters';
  if (hash.startsWith('#/games/pairs')) return 'pairs';
  if (hash.startsWith('#/games/math')) return 'math';
  return 'site';
};

export default function App() {
  const [route, setRoute] = useState(routeFrom);
  useEffect(() => {
    const onRouteChange = () => setRoute(routeFrom());
    window.addEventListener('hashchange', onRouteChange);
    return () => window.removeEventListener('hashchange', onRouteChange);
  }, []);

  const home = () => { window.location.hash = 'games'; };
  return <>{route === 'math' && <MathApp onHome={home} />}{route === 'letters' && <LettersApp onHome={home} />}{route === 'pairs' && <PairsApp onHome={home} />}{route === 'site' && <HomePage onPlay={r => { window.location.hash = r; }} />}</>;
}
