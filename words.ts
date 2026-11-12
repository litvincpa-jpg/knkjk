import apple from '@/assets/letters/word-apple.png';
import butterfly from '@/assets/letters/word-butterfly.png';
import wolf from '@/assets/letters/word-wolf.png';
import pear from '@/assets/letters/word-pear.png';
import house from '@/assets/letters/word-house.png';
import acorn from '@/assets/letters/word-acorn.png';
import zebra from '@/assets/letters/word-zebra.png';
import cat from '@/assets/letters/word-cat.png';
import strawberry from '@/assets/letters/word-strawberry.png';
import fox from '@/assets/letters/word-fox.png';
import lemon from '@/assets/letters/word-lemon.png';
import mouse from '@/assets/letters/word-mouse.png';
import ball from '@/assets/letters/word-ball.png';
import rhino from '@/assets/letters/word-rhino.png';
import cucumber from '@/assets/letters/word-cucumber.png';
import parrot from '@/assets/letters/word-parrot.png';
import fish from '@/assets/letters/word-fish.png';
import elephant from '@/assets/letters/word-elephant.png';
import tiger from '@/assets/letters/word-tiger.png';
import tulip from '@/assets/letters/word-tulip.png';
import duck from '@/assets/letters/word-duck.png';
import turtle from '@/assets/letters/word-turtle.png';
import watermelon from '@/assets/letters/word-watermelon.png';

import bear from '@/assets/zuma-monster.png';

export { bear };

export interface Word {
  key: string;
  /** строчная первая буква слова */
  letter: string;
  word: string;
  src: string;
  /** идентификатор записанного слова в спрайте голоса */
  wordId: string;
}

const W = (key: string, letter: string, word: string, src: string): Word => ({
  key,
  letter,
  word,
  src,
  wordId: `word_${key}`,
});

export const WORDS: Word[] = [
  W('watermelon', 'а', 'Арбуз', watermelon),
  W('butterfly', 'б', 'Бабочка', butterfly),
  W('wolf', 'в', 'Волк', wolf),
  W('pear', 'г', 'Груша', pear),
  W('house', 'д', 'Дом', house),
  W('acorn', 'ж', 'Жёлудь', acorn),
  W('zebra', 'з', 'Зебра', zebra),
  W('cat', 'к', 'Кот', cat),
  W('strawberry', 'к', 'Клубника', strawberry),
  W('fox', 'л', 'Лиса', fox),
  W('lemon', 'л', 'Лимон', lemon),
  W('mouse', 'м', 'Мышь', mouse),
  W('ball', 'м', 'Мячик', ball),
  W('rhino', 'н', 'Носорог', rhino),
  W('cucumber', 'о', 'Огурец', cucumber),
  W('parrot', 'п', 'Попугай', parrot),
  W('fish', 'р', 'Рыбка', fish),
  W('elephant', 'с', 'Слон', elephant),
  W('tiger', 'т', 'Тигр', tiger),
  W('tulip', 'т', 'Тюльпан', tulip),
  W('duck', 'у', 'Утёнок', duck),
  W('turtle', 'ч', 'Черепаха', turtle),
  W('apple', 'я', 'Яблоко', apple),
];

/** Буквы, с которыми есть слова в игре */
export const WORD_LETTERS = [...new Set(WORDS.map((w) => w.letter))];

/** Буквы для отвлекающих вариантов (всей азбуки для дошкольника достаточно) */
export const DECOY_LETTERS = 'АБВГДЖЗИКЛМНОПРСТУФЧШЯ'.toLowerCase();

export const byLetter = (letter: string): Word[] => WORDS.filter((w) => w.letter === letter);
export const byKey = (key: string): Word => WORDS.find((w) => w.key === key) ?? WORDS[0];
export const ALL_WORD_IMAGES = [bear, ...WORDS.map((w) => w.src)];
