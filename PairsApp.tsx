import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Home, Play, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';
import bg from '@/assets/bg.jpg';
import monster from '@/assets/zuma-monster.png';
import { ALL_OBJECT_IMAGES, OBJECTS, OBJECT_KEYS, type ObjKey } from '@/game/objects';
import { say, setSoundEnabled, sfx, stopSpeech, unlockAudio } from '@/game/audio';
import { bigConfetti } from '@/game/fx';
import { SiteDialog } from '@/site/Dialog';
import { loadPairsSave, storePairsSave, type PairsSave } from './storage';

const LEVELS = [
  { id: 1, pairs: 3, label: '3–4 года', name: 'Первые пары', columns: 3 },
  { id: 2, pairs: 4, label: '4–5 лет', name: 'Запоминаем', columns: 4 },
  { id: 3, pairs: 6, label: '5–7 лет', name: 'Большая поляна', columns: 4 },
];

interface Card {
  id: number;
  key: ObjKey;
  src: string;
  matched: boolean;
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

function makeCards(pairCount: number): Card[] {
  const keys = shuffle(OBJECT_KEYS).slice(0, pairCount);
  return shuffle(keys.flatMap(key => [0, 1].map(side => ({ id: `${key}-${side}-${Math.random()}`, key, src: OBJECTS[key].src, matched: false })))).map((card, id) => ({ ...card, id }));
}

export default function PairsApp({ onHome }: { onHome: () => void }) {
  const [save, setSave] = useState<PairsSave>(loadPairsSave);
  const [levelId, setLevelId] = useState(1);
  const [cards, setCards] = useState<Card[]>(() => makeCards(3));
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState('Найди две одинаковые картинки!');
  const [finished, setFinished] = useState(false);
  const [siteExit, setSiteExit] = useState(false);
  const timers = useRef<number[]>([]);
  const level = LEVELS.find(l => l.id === levelId) ?? LEVELS[0];
  const matched = cards.filter(c => c.matched).length / 2;
  const earned = moves <= level.pairs + 1 ? 3 : moves <= level.pairs + 3 ? 2 : 1;

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const start = useCallback((id: number) => {
    const next = LEVELS.find(l => l.id === id) ?? LEVELS[0];
    setLevelId(next.id);
    setCards(makeCards(next.pairs));
    setOpen([]); setMoves(0); setLocked(false); setFinished(false);
    setMessage(next.id === 1 ? 'Открывай карточки и ищи пару!' : `Запомни, где спрятались ${next.pairs * 2} картинки!`);
  }, []);

  useEffect(() => {
    document.body.classList.add('game-active');
    document.title = 'Найди пару | Zuma Luma';
    setSoundEnabled(save.sound);
    unlockAudio();
    ALL_OBJECT_IMAGES.forEach(src => { const image = new Image(); image.src = src; });
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock);
    return () => {
      document.body.classList.remove('game-active');
      timers.current.forEach(window.clearTimeout);
      window.removeEventListener('pointerdown', unlock);
      stopSpeech(); setSoundEnabled(false);
    };
  }, []);

  useEffect(() => { storePairsSave(save); setSoundEnabled(save.sound); }, [save]);

  const flip = (id: number) => {
    if (locked || finished || open.includes(id) || cards[id]?.matched) return;
    sfx.pop();
    const nextOpen = [...open, id];
    setOpen(nextOpen);
    if (nextOpen.length === 1) { setMessage('Теперь найди такую же картинку!'); return; }
    setLocked(true);
    const [first, second] = nextOpen;
    setMoves(m => m + 1);
    if (cards[first].key === cards[second].key) {
      later(() => {
        const updated = cards.map((card, index) => index === first || index === second ? { ...card, matched: true } : card);
        setCards(updated); setOpen([]); setLocked(false); sfx.correct();
        const done = updated.filter(c => c.matched).length / 2;
        setMessage(done === level.pairs ? 'Ура! Все пары найдены!' : 'Пара нашлась! Продолжай!');
        if (done === level.pairs) {
          const finalMoves = moves + 1;
          const stars = finalMoves <= level.pairs + 1 ? 3 : finalMoves <= level.pairs + 3 ? 2 : 1;
          setSave(s => ({ ...s, stars: { ...s.stars, [levelId]: Math.max(s.stars[levelId] ?? 0, stars) }, bestMoves: { ...s.bestMoves, [levelId]: Math.min(s.bestMoves[levelId] ?? Infinity, finalMoves) } }));
          later(() => { setFinished(true); sfx.win(); bigConfetti(); say('Ура! Все пары найдены!'); }, 500);
        }
      }, 520);
    } else {
      setMessage('Пока не пара. Запомни картинки!');
      later(() => { setOpen([]); setLocked(false); sfx.tap(); }, 950);
    }
  };

  const toggleSound = () => {
    const sound = !save.sound;
    setSave(s => ({ ...s, sound }));
    if (sound) sfx.tap(); else stopSpeech();
  };

  const gridClass = useMemo(() => `zl-pairs-grid zl-pairs-grid--${level.columns}`, [level.columns]);

  return <div className="zl-pairs-app">
    <img className="zl-pairs-bg" src={bg} alt="" />
    <header className="zl-pairs-header"><button type="button" onClick={() => setSiteExit(true)} aria-label="На сайт Zuma Luma"><Home /></button><div className="zl-pairs-title"><span>Игра на внимание</span><h1>Найди пару</h1></div><button type="button" onClick={toggleSound} aria-label={save.sound ? 'Выключить звук' : 'Включить звук'}>{save.sound ? <Volume2 /> : <VolumeX />}</button></header>
    <main className="zl-pairs-main">
      <div className="zl-pairs-toolbar"><div className="zl-pairs-levels" role="tablist" aria-label="Сложность">{LEVELS.map(l => <button key={l.id} type="button" role="tab" aria-selected={levelId === l.id} className={levelId === l.id ? 'is-active' : ''} onClick={() => start(l.id)}><span>{l.name}</span><small>{l.label} · {l.pairs * 2} карточек</small>{(save.stars[l.id] ?? 0) > 0 && <i>{Array.from({ length: save.stars[l.id] }, (_, i) => <Star key={i} fill="currentColor" />)}</i>}</button>)}</div><div className="zl-pairs-stats"><span>Ходы <b>{moves}</b></span><span>Пары <b>{matched}/{level.pairs}</b></span>{save.bestMoves[levelId] && <span>Рекорд <b>{save.bestMoves[levelId]}</b></span>}<button type="button" onClick={() => start(levelId)}><RotateCcw />Заново</button></div></div>
      <div className="zl-pairs-play"><div className="zl-pairs-guide"><img src={monster} alt="Люма" /><p aria-live="polite">{message}</p><span>{earned === 3 ? 'Так держать!' : 'Ты справишься!'}</span></div><div className={gridClass}>{cards.map((card, index) => {
        const flipped = card.matched || open.includes(index);
        return <motion.button layout key={card.id} type="button" className={`zl-memory-card ${flipped ? 'is-flipped' : ''} ${card.matched ? 'is-matched' : ''}`} onClick={() => flip(index)} aria-label={flipped ? OBJECTS[card.key].forms[0] : `Закрытая карточка ${index + 1}`} disabled={card.matched} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.035 }}><span className="zl-memory-inner"><span className="zl-memory-back"><Star fill="currentColor" /><i>Zuma<br />Luma</i></span><span className="zl-memory-front"><img src={card.src} alt="" /></span></span></motion.button>;
      })}</div></div>
    </main>
    <AnimatePresence>{finished && <motion.div className="zl-pairs-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="zl-pairs-result-card" initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }}><span>Все пары найдены!</span><h2>Уровень пройден</h2><div className="zl-result-stars">{[0, 1, 2].map(i => <motion.span key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.2 + i * 0.18 }}><Star fill={i < earned ? 'currentColor' : '#e8dfcf'} /></motion.span>)}</div><p>{moves} ходов · лучший результат сохранён</p><div><button type="button" onClick={() => start(levelId)}><RotateCcw />Ещё раз</button>{levelId < LEVELS.length ? <button type="button" onClick={() => start(levelId + 1)}>Сложнее<ArrowRight /></button> : <button type="button" onClick={() => start(1)}>Сначала<Play /></button>}</div><button type="button" className="zl-result-home" onClick={onHome}>На главную Zuma Luma</button></motion.div></motion.div>}</AnimatePresence>
    {siteExit && <SiteDialog title="Вернуться на сайт?" onClose={() => setSiteExit(false)}><p className="pk-dialog-description">Заработанные звёзды и рекорды сохранятся. Текущий расклад начнётся заново.</p><button type="button" className="pk-button pk-button--full" onClick={onHome}>На главную Zuma Luma</button><button type="button" className="pk-text-button" onClick={() => setSiteExit(false)}>Остаться в игре</button></SiteDialog>}
  </div>;
}
