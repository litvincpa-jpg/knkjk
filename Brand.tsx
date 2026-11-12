import { useId } from 'react';

export function SunnyStar({ className = '' }: { className?: string }) {
  const id = `sun-${useId().replace(/:/g, '')}`;
  return <svg viewBox="0 0 100 100" className={className} aria-hidden="true" fill="none"><defs><linearGradient id={id} x1="27" y1="7" x2="66" y2="96" gradientUnits="userSpaceOnUse"><stop stopColor="#FFF083" /><stop offset="0.55" stopColor="#FFC431" /><stop offset="1" stopColor="#FFA71B" /></linearGradient></defs><path d="M43 10Q50 -2 57 11L67 30L88 34Q103 36 92 48L76 64L79 86Q81 100 67 93L50 83L31 93Q18 99 21 84L24 64L8 49Q-3 37 13 34L34 30Z" fill={`url(#${id})`} stroke="#FFAD25" strokeWidth="3" /><ellipse cx="36" cy="53" rx="4.5" ry="6" fill="#252441" /><ellipse cx="65" cy="53" rx="4.5" ry="6" fill="#252441" /><path d="M43 64Q50 76 58 64" stroke="#252441" strokeWidth="4" strokeLinecap="round" /></svg>;
}

const LETTERS = ['#28bde3', '#ff8d26', '#a26be7', '#8bd239', '#ffcf31', '#f565a5', '#24b9df', '#ff8b2a'];

function Word({ children, offset = 0 }: { children: string; offset?: number }) {
  return <span className="zl-logo-word">{[...children].map((letter, i) => <i key={i} style={{ '--letter-color': LETTERS[(i + offset) % LETTERS.length] } as React.CSSProperties}>{letter}</i>)}</span>;
}

export function Logo({ footer = false }: { footer?: boolean }) {
  return <a className={`zl-logo${footer ? ' zl-logo--footer' : ''}`} href="#home" aria-label="Zuma Luma, на главную" onClick={event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><span className="zl-logo-badge" aria-hidden="true"><Word>Zuma</Word><Word offset={4}>Luma</Word></span></a>;
}
