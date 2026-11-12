import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, BookOpen, Brain, Check, ChevronDown, Gamepad2, GraduationCap,
  Heart, Home, LockKeyhole, Menu, Pause, Play, Route, ShieldCheck, Sparkles,
  Star, Trophy, UserRound, Users, Volume2, X,
} from 'lucide-react';
import heroImage from '@/assets/site/zuma-hero.jpg';
import monster from '@/assets/zuma-monster.png';
import apple from '@/assets/obj-apple.png';
import pear from '@/assets/obj-pear.png';
import butterfly from '@/assets/obj-butterfly.png';
import cat from '@/assets/letters/word-cat.png';
import { Logo } from './Brand';
import { SiteDialog } from './Dialog';
import { ProfileDialog } from './ProfileDialog';
import { loadProfile } from './profile';
import { loadSave } from '@/game/storage';
import { loadLettersSave } from '@/letters/storage';
import { loadPairsSave } from '@/pairs/storage';
import './zuma.css';

type RouteName = '/games/math' | '/games/letters' | '/games/pairs';
type Modal = 'profile' | 'video' | 'privacy' | 'parents' | null;

const NAV = [
  { id: 'games', label: 'Игры', icon: Gamepad2 },
  { id: 'learning', label: 'Обучение', icon: BookOpen },
  { id: 'parents', label: 'Для родителей', icon: Users },
  { id: 'pricing', label: 'Тарифы', icon: Trophy },
];

const BENEFITS = [
  { icon: ShieldCheck, title: 'Безопасно\nдля детей', text: 'Без рекламы, чатов и внешних ссылок в играх.', color: 'mint' },
  { icon: Brain, title: 'Развитие\nлогики', text: 'Задачи становятся сложнее вместе с ребёнком.', color: 'orange' },
  { icon: GraduationCap, title: 'Подготовка\nк школе', text: 'Счёт, буквы, внимание и первые слова.', color: 'sky' },
  { icon: Route, title: 'Индивидуальный\nпуть', text: 'Уровни открываются постепенно, без гонки.', color: 'lilac' },
];

const PROGRAMS = [
  {
    age: '3–4', label: '3–4 года', title: 'Первые открытия', monsterClass: '',
    text: 'Крупные картинки, короткие задания и добрые подсказки Люмы. Учимся слушать, сравнивать и называть.',
    skills: ['Счёт предметов до 5', 'Цвета и одинаковые картинки', 'Первые буквы в знакомых словах'],
    game: 'Начните со счёта и игры «Найди пару»', color: '#88cf35',
  },
  {
    age: '4–5', label: '4–5 лет', title: 'Уверенно пробуем', monsterClass: 'zl-monster--orange',
    text: 'Больше самостоятельности: ребёнок решает примеры, находит пропущенные буквы и запоминает картинки.',
    skills: ['Сложение и вычитание до 5', 'Первая и пропущенная буква', 'Память и внимание к деталям'],
    game: 'Попробуйте второй уровень математики', color: '#ff9d2e',
  },
  {
    age: '5–7', label: '5–7 лет', title: 'Готовимся к школе', monsterClass: 'zl-monster--green',
    text: 'Смешанные задания тренируют переключение внимания, а повторные попытки помогают закрепить результат.',
    skills: ['Числа до 10 и последовательности', 'Буквы, слоги и целые слова', 'Логика и самостоятельные решения'],
    game: 'Откройте уровень «Всё вместе»', color: '#24b7d9',
  },
];

const FAQS = [
  { q: 'Нужно ли платить или вводить карту?', a: 'Нет. Все игры и уровни на этом сайте открыты бесплатно. Банковская карта, почта и пароль не нужны, скрытых списаний нет.' },
  { q: 'Подойдёт ли Zuma Luma без чтения?', a: 'Да. Люма озвучивает вопросы и подсказки, а ответы выбираются нажатием на крупные картинки или числа. Звук можно выключить в любой момент.' },
  { q: 'Что будет, если ребёнок ошибётся?', a: 'Ничего страшного: ошибочный вариант мягко гаснет, герой предлагает попробовать ещё раз. После двух ошибок появляется подсказка. Таймера и проигрыша нет.' },
  { q: 'Где хранится прогресс?', a: 'Звёзды, открытые уровни и необязательный профиль сохраняются только в этом браузере. Мы не отправляем данные ребёнка на сервер и не используем микрофон.' },
];

const GAME_CARDS: { route: RouteName; title: string; subtitle: string; ages: string; type: 'math' | 'letters' | 'pairs'; skills: string[] }[] = [
  { route: '/games/math', title: 'Весёлая математика', subtitle: 'Считаем с Люмой', ages: '3–7 лет', type: 'math', skills: ['Счёт до 10', 'Сложение', 'Сравнение'] },
  { route: '/games/letters', title: 'Знакомство с буквами', subtitle: 'Слова с монстриками', ages: '4–7 лет', type: 'letters', skills: ['23 слова', 'Первые буквы', '3 типа заданий'] },
  { route: '/games/pairs', title: 'Найди пару', subtitle: 'Игра на внимание', ages: '3–7 лет', type: 'pairs', skills: ['Память', '3 сложности', 'Без таймера'] },
];

function Reveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay }}>{children}</motion.div>;
}

function GamePicture({ type }: { type: 'math' | 'letters' | 'pairs' }) {
  if (type === 'math') return <div className="zl-game-scene zl-game-scene--math" aria-hidden="true"><span className="zl-sum">3 <b>+</b> 2</span><div className="zl-apples">{[0, 1, 2, 3, 4].map(i => <img key={i} src={apple} alt="" />)}</div><img className="zl-scene-monster" src={monster} alt="" /></div>;
  if (type === 'letters') return <div className="zl-game-scene zl-game-scene--letters" aria-hidden="true"><img className="zl-scene-cat" src={cat} alt="" /><div className="zl-word"><span>К</span><span className="is-empty">О</span><span>Т</span></div><img className="zl-scene-monster" src={monster} alt="" /></div>;
  return <div className="zl-game-scene zl-game-scene--pairs" aria-hidden="true"><div className="zl-mini-cards">{[apple, pear, butterfly, apple].map((src, i) => <span key={i} className={i === 2 ? 'is-back' : ''}>{i !== 2 && <img src={src} alt="" />}{i === 2 && <Star />}</span>)}</div><img className="zl-scene-monster" src={monster} alt="" /></div>;
}

function DemoPlayer() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep(s => (s + 1) % 3), 2600);
    return () => window.clearInterval(id);
  }, [playing]);
  return <div className="zl-demo-player">
    <div className="zl-demo-screen">
      <AnimatePresence mode="wait">
        <motion.div key={step} className="zl-demo-slide" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          {step === 0 && <><span className="zl-demo-label">1. Слушаем вопрос</span><div className="zl-demo-equation">3 + 2 = <b>?</b></div><div className="zl-demo-objects">{[0, 1, 2, 3, 4].map(i => <img key={i} src={apple} alt="" />)}</div><p>Люма озвучивает задание и помогает посчитать.</p></>}
          {step === 1 && <><span className="zl-demo-label">2. Выбираем ответ</span><div className="zl-demo-answers">{[4, 5, 6].map(n => <span key={n} className={n === 5 ? 'is-correct' : ''}>{n}{n === 5 && <Check />}</span>)}</div><p>Крупные кнопки удобно нажимать на планшете и телефоне.</p></>}
          {step === 2 && <><span className="zl-demo-label">3. Получаем звёзды</span><div className="zl-demo-stars">{[0, 1, 2].map(i => <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.18 }}><Star fill="currentColor" /></motion.span>)}</div><p>Лучший результат сохраняется, а следующий уровень открывается.</p></>}
        </motion.div>
      </AnimatePresence>
      <img src={monster} alt="Люма" className="zl-demo-monster" />
    </div>
    <div className="zl-demo-controls"><button type="button" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'Поставить превью на паузу' : 'Продолжить превью'}>{playing ? <Pause /> : <Play fill="currentColor" />}</button><div className="zl-demo-dots">{[0, 1, 2].map(i => <button key={i} type="button" className={step === i ? 'is-active' : ''} onClick={() => setStep(i)} aria-label={`Показать шаг ${i + 1}`} />)}</div><span>Интерактивное превью</span></div>
  </div>;
}

function MiniLesson() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const answer = a + b;
  const options = useMemo(() => [answer - 1, answer, answer + 1].sort(() => Math.random() - 0.5), [a, b, answer]);
  const next = () => {
    const na = 1 + Math.floor(Math.random() * 4);
    const nb = 1 + Math.floor(Math.random() * (6 - na));
    setA(na); setB(nb); setPicked(null);
  };
  return <div className="zl-mini-lesson">
    <div className="zl-mini-top"><span><Sparkles size={18} /> Попробуйте прямо здесь</span><button type="button" onClick={next}>Новый пример</button></div>
    <div className="zl-mini-equation" aria-label={`${a} плюс ${b}`}><b>{a}</b><span>+</span><b>{b}</b><span>=</span><b className={picked === answer ? 'is-solved' : ''}>{picked === answer ? answer : '?'}</b></div>
    <div className="zl-mini-options">{options.map(n => <button key={n} type="button" disabled={picked === answer} onClick={() => setPicked(n)} className={picked === n ? (n === answer ? 'is-correct' : 'is-wrong') : ''}>{n}{picked === n && (n === answer ? <Check /> : <X />)}</button>)}</div>
    <p aria-live="polite">{picked == null ? 'Нажмите на правильный ответ' : picked === answer ? 'Правильно! В игре Люма похвалит так же.' : 'Почти! Попробуйте ещё раз — ошибка ничего не отнимает.'}</p>
  </div>;
}

export default function HomePage({ onPlay }: { onPlay: (route: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [profile, setProfile] = useState(loadProfile);
  const [active, setActive] = useState('games');
  const [program, setProgram] = useState(0);
  const [faq, setFaq] = useState(0);
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const math = loadSave();
  const letters = loadLettersSave();
  const pairs = loadPairsSave();
  const mathStars = Object.values(math.stars).reduce((a, b) => a + b, 0);
  const letterStars = Object.values(letters.stars).reduce((a, b) => a + b, 0);
  const pairStars = Object.values(pairs.stars).reduce((a, b) => a + b, 0);
  const totalStars = mathStars + letterStars + pairStars;
  const totalDone = [math.stars, letters.stars, pairs.stars].reduce((sum, item) => sum + Object.values(item).filter(v => v > 0).length, 0);

  useEffect(() => {
    document.title = 'Zuma Luma — учимся играя';
    document.body.classList.remove('game-active');
    if (window.location.hash === '#games') {
      window.requestAnimationFrame(() => document.getElementById('games')?.scrollIntoView());
    }
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-25% 0px -60% 0px' });
    NAV.forEach(item => { const el = document.getElementById(item.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const play = (route: RouteName) => { setModal(null); onPlay(route); };
  const go = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  const p = PROGRAMS[program];

  return <div className="zuma-site">
    <a href="#games" className="zl-skip">Перейти к играм</a>
    <header className="zl-header">
      <div className="zl-header-pill">
        <Logo />
        <nav className="zl-nav" aria-label="Основная навигация">{NAV.map(item => <button key={item.id} type="button" className={active === item.id ? 'is-active' : ''} onClick={() => go(item.id)}><item.icon size={20} />{item.label}</button>)}</nav>
        <button className="zl-login" type="button" onClick={() => setModal('profile')}><UserRound size={19} /><span>{profile ? profile.name : 'Войти / Регистрация'}</span></button>
        <button className="zl-menu" type="button" aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? <X /> : <Menu />}</button>
      </div>
      <AnimatePresence>{menuOpen && <motion.nav className="zl-mobile-nav" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} aria-label="Мобильная навигация">{NAV.map(item => <button key={item.id} type="button" onClick={() => go(item.id)}><item.icon />{item.label}<ArrowRight /></button>)}<button type="button" onClick={() => { setMenuOpen(false); setModal('profile'); }}><UserRound />{profile ? `Профиль: ${profile.name}` : 'Войти / Регистрация'}<ArrowRight /></button></motion.nav>}</AnimatePresence>
    </header>

    <main>
      <section className="zl-hero" ref={heroRef} aria-labelledby="hero-title">
        <motion.img className="zl-hero-bg" src={heroImage} alt="Весёлые монстрики Zuma Luma на зелёной поляне" style={reduce ? undefined : { scale: heroScale, y: heroY }} />
        <div className="zl-hero-symbols" aria-hidden="true"><span className="zl-sym zl-sym--1">1</span><span className="zl-sym zl-sym--2">2</span><span className="zl-sym zl-sym--3">3</span><span className="zl-sym zl-sym--a">А</span><span className="zl-sym zl-sym--b">Б</span><span className="zl-sym zl-sym--v">В</span><Star className="zl-float-star zl-float-star--1" fill="currentColor" /><Star className="zl-float-star zl-float-star--2" fill="currentColor" /></div>
        <motion.div className="zl-hero-copy" style={reduce ? undefined : { y: copyY }}>
          <motion.h1 id="hero-title" initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}><span className="zl-title-green">Учимся играя</span><span className="zl-title-brand">с <i>Zuma</i> <b>Luma!</b></span></motion.h1>
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>Увлекательные развивающие игры для детей<br className="zl-desktop-br" /> <strong>от 3 до 7 лет.</strong> Подготовка к школе, логика,<br className="zl-desktop-br" /> чтение и математика в игровой форме!</motion.p>
          <motion.div className="zl-hero-actions" initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}><button type="button" className="zl-primary" onClick={() => play('/games/math')}><span>Начать играть<br />бесплатно!</span><i><Play fill="currentColor" /></i><Sparkles className="zl-btn-spark" /></button><button type="button" className="zl-video-link" onClick={() => setModal('video')}><Play size={17} fill="currentColor" />Посмотреть видео</button></motion.div>
          <motion.div className="zl-hero-note" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}><ShieldCheck size={19} />Без рекламы и регистрации</motion.div>
        </motion.div>
        <svg className="zl-hero-wave" viewBox="0 0 1600 105" preserveAspectRatio="none" aria-hidden="true"><path d="M0 58C65 18 120 87 195 54S311 18 385 55s127 35 201 0 131-38 206-1 134 34 208 0 129-35 204 0 132 38 205 0 132-27 191 0v51H0Z" fill="#effcff" /></svg>
      </section>

      <section className="zl-benefits" aria-labelledby="benefits-title">
        <div className="zl-container zl-benefits-grid"><Reveal className="zl-benefits-title"><span className="zl-eyebrow">Маленьким открытиям — большая поддержка</span><h2 id="benefits-title">Почему<br />выбирают нас?</h2><p>Играем по 10–15 минут в день и радуемся каждому новому успеху.</p></Reveal>{BENEFITS.map((item, i) => <Reveal key={item.title} className={`zl-benefit zl-benefit--${item.color}`} delay={i * 0.07}><div className="zl-benefit-icon"><item.icon /></div><h3>{item.title.split('\n').map((line, n) => <span key={n}>{line}</span>)}</h3><p>{item.text}</p><img src={monster} alt="" className={i === 1 ? 'zl-monster--orange' : i === 2 ? 'zl-monster--green' : ''} /></Reveal>)}</div>
      </section>

      <section id="games" className="zl-section zl-games" aria-labelledby="games-title">
        <div className="zl-container"><Reveal className="zl-section-head"><span className="zl-eyebrow">Выбирай приключение</span><h2 id="games-title">Во что поиграем сегодня?</h2><p>Каждая игра — это настоящие уровни, озвученные задания и сохранённые звёзды.</p></Reveal><div className="zl-games-grid">{GAME_CARDS.map((game, i) => <Reveal key={game.route} className={`zl-game-card zl-game-card--${game.type}`} delay={i * 0.08}><div className="zl-game-card-top"><span>{game.ages}</span><span><Star size={15} fill="currentColor" />Бесплатно</span></div><GamePicture type={game.type} /><div className="zl-game-card-body"><span className="zl-game-subtitle">{game.subtitle}</span><h3>{game.title}</h3><div className="zl-skill-tags">{game.skills.map(s => <span key={s}>{s}</span>)}</div><button type="button" onClick={() => play(game.route)}>Играть<ArrowRight /></button></div></Reveal>)}</div><Reveal className="zl-games-note"><Volume2 /><p><strong>Можно играть, даже если ещё не умеешь читать.</strong> Герои озвучивают задания и подсказывают следующий шаг.</p></Reveal></div>
      </section>

      <section id="learning" className="zl-section zl-learning" aria-labelledby="learning-title">
        <div className="zl-container"><Reveal className="zl-section-head zl-section-head--left"><span className="zl-eyebrow">Обучение в своём темпе</span><h2 id="learning-title">От первой буквы<br />до уверенного счёта</h2></Reveal><div className="zl-age-tabs" role="tablist" aria-label="Возраст ребёнка">{PROGRAMS.map((item, i) => <button key={item.age} type="button" role="tab" aria-selected={program === i} onClick={() => setProgram(i)} className={program === i ? 'is-active' : ''}>{item.label}</button>)}</div><div className="zl-learning-grid"><AnimatePresence mode="wait"><motion.div key={p.age} className="zl-program-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.25 }}><div className="zl-program-copy"><span className="zl-program-age" style={{ background: p.color }}>{p.age}</span><h3>{p.title}</h3><p>{p.text}</p><ul>{p.skills.map(skill => <li key={skill}><Check />{skill}</li>)}</ul><div className="zl-program-tip"><Route /><span>{p.game}</span></div></div><img src={monster} className={p.monsterClass} alt="Герой Zuma Luma" /></motion.div></AnimatePresence><Reveal delay={0.1}><MiniLesson /></Reveal></div></div>
      </section>

      <section id="parents" className="zl-section zl-parents" aria-labelledby="parents-title">
        <div className="zl-container zl-parents-grid"><Reveal className="zl-parents-copy"><span className="zl-eyebrow">Для родителей</span><h2 id="parents-title">Вы видите успехи,<br />ребёнок — приключение</h2><p>Прогресс не прячется за оценками. Здесь видно, какие игры уже открыты и сколько звёзд заработано на этом устройстве.</p><div className="zl-parent-points"><span><ShieldCheck />Без рекламы и чатов</span><span><LockKeyhole />Данные только в браузере</span><span><Heart />Ошибки без наказания</span></div><button type="button" className="zl-outline-button" onClick={() => setModal('parents')}>3 совета для занятий<BookOpen /></button></Reveal><Reveal className="zl-dashboard" delay={0.1}><div className="zl-dashboard-head"><div><span>{profile ? `Прогресс: ${profile.name}` : 'Прогресс на этом устройстве'}</span><strong>{totalStars}<Star fill="currentColor" /></strong></div><img src={monster} alt="" /></div><div className="zl-dashboard-total"><span>Пройдено уровней</span><b>{totalDone} из 15</b><progress max={15} value={totalDone} /></div><div className="zl-dashboard-rows"><div><span>Математика</span><b>{mathStars} / 18</b><progress max={18} value={mathStars} /></div><div><span>Буквы</span><b>{letterStars} / 18</b><progress max={18} value={letterStars} /></div><div><span>Найди пару</span><b>{pairStars} / 9</b><progress max={9} value={pairStars} /></div></div><div className="zl-dashboard-actions"><button type="button" onClick={() => setModal('profile')}>{profile ? 'Открыть профиль' : 'Создать профиль'}<UserRound /></button><button type="button" onClick={() => play('/games/math')}>Продолжить<Play fill="currentColor" /></button></div><p className="zl-local-note">Профиль необязателен и не является облачным аккаунтом.</p></Reveal></div>
      </section>

      <section id="pricing" className="zl-section zl-pricing" aria-labelledby="pricing-title"><div className="zl-container"><Reveal className="zl-section-head"><span className="zl-eyebrow">Честно и просто</span><h2 id="pricing-title">Все игры — бесплатно</h2><p>Не нужно выбирать подписку, чтобы открыть следующий уровень.</p></Reveal><div className="zl-price-grid"><Reveal className="zl-price-card"><span className="zl-price-label">Для первой игры</span><h3>Гость</h3><div className="zl-price">0 <small>₽</small></div><ul><li><Check />Все 15 уровней</li><li><Check />Сохранение звёзд</li><li><Check />Без регистрации</li></ul><button type="button" onClick={() => play('/games/math')}>Играть сейчас<ArrowRight /></button></Reveal><Reveal className="zl-price-card zl-price-card--featured" delay={0.08}><span className="zl-price-badge">Тоже 0 ₽</span><span className="zl-price-label">Для семьи</span><h3>С профилем</h3><div className="zl-price">0 <small>₽</small></div><ul><li><Check />Всё из тарифа «Гость»</li><li><Check />Имя, возраст и аватар</li><li><Check />Общий прогресс родителям</li></ul><button type="button" onClick={() => setModal('profile')}>{profile ? 'Мой профиль' : 'Создать профиль'}<UserRound /></button></Reveal><Reveal className="zl-price-info" delay={0.16}><ShieldCheck /><h3>Без сюрпризов</h3><p>Мы не просим почту, пароль или данные карты. На сайте нет рекламы, платных подсказок и автоматических продлений.</p><button type="button" onClick={() => setModal('privacy')}>Как хранятся данные<ArrowRight /></button></Reveal></div></div></section>

      <section className="zl-section zl-faq" aria-labelledby="faq-title"><div className="zl-container zl-faq-grid"><Reveal><span className="zl-eyebrow">Родители спрашивают</span><h2 id="faq-title">Всё просто.<br />Даже для взрослых.</h2><img src={monster} alt="Люма" /></Reveal><div className="zl-faq-list">{FAQS.map((item, i) => <Reveal key={item.q} delay={i * 0.04}><div className={`zl-faq-item ${faq === i ? 'is-open' : ''}`}><button type="button" aria-expanded={faq === i} onClick={() => setFaq(faq === i ? -1 : i)}><span>{item.q}</span><ChevronDown /></button><AnimatePresence initial={false}>{faq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><p>{item.a}</p></motion.div>}</AnimatePresence></div></Reveal>)}</div></div></section>

      <section className="zl-final"><div className="zl-container zl-final-inner"><div><span className="zl-eyebrow">Монстрики уже ждут</span><h2>Большие открытия<br />начинаются с игры!</h2><button type="button" className="zl-primary" onClick={() => play('/games/math')}><span>Начать играть<br />бесплатно!</span><i><Play fill="currentColor" /></i></button></div><img src={monster} alt="Люма приглашает играть" /><div className="zl-final-stars" aria-hidden="true"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div></div></section>
    </main>

    <footer className="zl-footer"><div className="zl-container zl-footer-grid"><div><Logo footer /><p>Маленькие игры.<br />Большое счастливое детство.</p></div><nav aria-label="Разделы сайта"><strong>Открывайте Zuma Luma</strong>{NAV.map(item => <button key={item.id} type="button" onClick={() => go(item.id)}>{item.label}</button>)}</nav><div className="zl-footer-links"><strong>Родителям</strong><button type="button" onClick={() => setModal('profile')}>Профиль ребёнка</button><button type="button" onClick={() => setModal('parents')}>Как заниматься</button><button type="button" onClick={() => setModal('privacy')}>Конфиденциальность</button></div><button className="zl-to-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })} aria-label="Наверх"><Home /></button></div><div className="zl-container zl-footer-bottom"><span>© {new Date().getFullYear()} Zuma Luma</span><span>Сделано с заботой о детях<Heart size={15} /></span></div></footer>

    {modal === 'profile' && <ProfileDialog profile={profile} onChange={setProfile} onClose={() => setModal(null)} onPlay={() => play('/games/math')} />}
    {modal === 'video' && <SiteDialog title="Как проходит игра" onClose={() => setModal(null)} wide><p className="pk-dialog-description">Короткое интерактивное превью: от вопроса до заслуженных звёзд.</p><DemoPlayer /><button type="button" className="pk-button pk-button--full" onClick={() => play('/games/math')}>Попробовать самому<ArrowRight /></button></SiteDialog>}
    {modal === 'privacy' && <SiteDialog title="Данные остаются у вас" onClose={() => setModal(null)}><div className="pk-reading-body"><section><h3>Что сохраняет Zuma Luma</h3><p>Только игровой прогресс, настройку звука и — если вы создали профиль — имя, возраст и выбранный аватар. Всё хранится локально в вашем браузере.</p></section><section><h3>Чего мы не делаем</h3><p>Не запрашиваем почту, пароль, платёжные данные, микрофон или геолокацию. Не отправляем сведения на сервер и не показываем рекламу.</p></section><section><h3>Как удалить сохранения</h3><p>Выйдите из профиля в его настройках или очистите данные сайта в браузере. Выход из профиля не стирает уже заработанные игровые звёзды.</p></section></div></SiteDialog>}
    {modal === 'parents' && <SiteDialog title="Три совета для спокойных занятий" onClose={() => setModal(null)} wide><div className="pk-reading-body"><section><h3>1. Начинайте с десяти минут</h3><p>Одного уровня достаточно для первого занятия. Остановитесь, пока игра ещё нравится, — так ребёнок охотнее вернётся завтра.</p></section><section><h3>2. Дайте время подумать</h3><p>Не называйте ответ сразу. Можно посчитать предметы вместе, а затем попросить ребёнка нажать кнопку самостоятельно. Подсказка появится автоматически после ошибок.</p></section><section><h3>3. Переносите игру в жизнь</h3><p>После уровня посчитайте ложки на столе, найдите два одинаковых носка или придумайте слово на изученную букву. Это закрепляет навык без экрана.</p></section></div><button type="button" className="pk-button pk-button--full" onClick={() => play('/games/math')}>Выбрать первый уровень<ArrowRight /></button></SiteDialog>}
  </div>;
}
