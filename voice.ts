/* Голос Мишки: заранее записанные фразы в одном MP3-спрайте.
   Генерация: scripts/gen_letters_voice.py */

import bearMap from '@/assets/letters/bear.json';
import { createVoiceEngine, type SpriteMap } from '@/game/voiceCore';
import { txt, type PhraseId } from './phrases';

const map = bearMap as unknown as SpriteMap;
// Веб-версия использует локальную браузерную озвучку; внешние аудиофайлы не требуются.
const bearMp3 = 'data:audio/mpeg;base64,';
const engine = createVoiceEngine(bearMp3);

export const loadLettersVoice = () => engine.load();

export const stopLettersVoice = () => engine.stop();

/** Произнести последовательность фраз. Новая реплика прерывает предыдущую. */
export function speakL(ids: (PhraseId | string)[], opts: { gap?: number } = {}) {
  engine.speak(ids.map((id) => txt(id as PhraseId)).join(' '), ids.map((id) => map[id]).filter((v): v is [number, number] => !!v), opts);
}
