import apple from '@/assets/obj-apple.png';
import pear from '@/assets/obj-pear.png';
import strawberry from '@/assets/obj-strawberry.png';
import carrot from '@/assets/obj-carrot.png';
import acorn from '@/assets/obj-acorn.png';
import mushroom from '@/assets/obj-mushroom.png';
import duck from '@/assets/obj-duck.png';
import fish from '@/assets/obj-fish.png';
import ladybug from '@/assets/obj-ladybug.png';
import tulip from '@/assets/obj-tulip.png';
import ball from '@/assets/obj-ball.png';
import butterfly from '@/assets/obj-butterfly.png';

export type Gender = 'm' | 'f' | 'n';

export type ObjKey =
  | 'apple'
  | 'pear'
  | 'strawberry'
  | 'carrot'
  | 'acorn'
  | 'mushroom'
  | 'duck'
  | 'fish'
  | 'ladybug'
  | 'tulip'
  | 'ball'
  | 'butterfly';

export interface GameObject {
  key: ObjKey;
  src: string;
  gender: Gender;
  /** Формы слова для чисел 1 / 2–4 / 5+ */
  forms: [string, string, string];
  /** Именительный падеж множественного числа */
  nomPl: string;
  /** Одушевлённое (влияет на винительный падеж) */
  animate: boolean;
}

const def = (
  key: ObjKey,
  src: string,
  gender: Gender,
  forms: [string, string, string],
  nomPl: string,
  animate = false,
): GameObject => ({ key, src, gender, forms, nomPl, animate });

export const OBJECTS: Record<ObjKey, GameObject> = {
  apple: def('apple', apple, 'n', ['яблоко', 'яблока', 'яблок'], 'яблоки'),
  pear: def('pear', pear, 'f', ['груша', 'груши', 'груш'], 'груши'),
  strawberry: def('strawberry', strawberry, 'f', ['клубничка', 'клубнички', 'клубничек'], 'клубнички'),
  carrot: def('carrot', carrot, 'f', ['морковка', 'морковки', 'морковок'], 'морковки'),
  acorn: def('acorn', acorn, 'm', ['жёлудь', 'жёлудя', 'желудей'], 'жёлуди'),
  mushroom: def('mushroom', mushroom, 'm', ['гриб', 'гриба', 'грибов'], 'грибы'),
  duck: def('duck', duck, 'm', ['утёнок', 'утёнка', 'утят'], 'утята', true),
  fish: def('fish', fish, 'f', ['рыбка', 'рыбки', 'рыбок'], 'рыбки', true),
  ladybug: def('ladybug', ladybug, 'f', ['божья коровка', 'божьи коровки', 'божьих коровок'], 'божьи коровки', true),
  tulip: def('tulip', tulip, 'm', ['тюльпан', 'тюльпана', 'тюльпанов'], 'тюльпаны'),
  ball: def('ball', ball, 'm', ['мячик', 'мячика', 'мячиков'], 'мячики'),
  butterfly: def('butterfly', butterfly, 'f', ['бабочка', 'бабочки', 'бабочек'], 'бабочки', true),
};

export const OBJECT_KEYS = Object.keys(OBJECTS) as ObjKey[];
export const ALL_OBJECT_IMAGES = OBJECT_KEYS.map((k) => OBJECTS[k].src);

