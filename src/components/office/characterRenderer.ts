// Procedural portraits and walking sprites adapted for Formative 2D Office Floor.
// Fully pixel-drawn procedural sprites layered: skin -> clothes -> face -> hair -> glasses.

export const PORTRAIT_W = 18;
export const PORTRAIT_H = 28;
export const SCENE_W = 18;
export const SCENE_H = 32;

const OUTLINE: RGB = [38, 34, 46];
const HX0 = 4, HX1 = 13; // head skin columns

export type RGB = [number, number, number];
type Buf = Uint8ClampedArray;

let CUR_W = PORTRAIT_W, CUR_H = PORTRAIT_H;

const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
export function shades(rgb: RGB, dl = 1.22, dd = 0.68): [RGB, RGB, RGB] {
  return [
    [clamp(rgb[0] * dl), clamp(rgb[1] * dl), clamp(rgb[2] * dl)],
    [rgb[0], rgb[1], rgb[2]],
    [clamp(rgb[0] * dd), clamp(rgb[1] * dd), clamp(rgb[2] * dd)],
  ];
}

function set(buf: Buf, x: number, y: number, c: RGB, a = 255): void {
  if (x < 0 || x >= CUR_W || y < 0 || y >= CUR_H) return;
  const i = (y * CUR_W + x) * 4;
  buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = a;
}

function alphaAt(buf: Buf, x: number, y: number): number {
  if (x < 0 || x >= CUR_W || y < 0 || y >= CUR_H) return 0;
  return buf[(y * CUR_W + x) * 4 + 3];
}

function rect(buf: Buf, x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(buf, x, y, c);
}

// Palettes
interface SkinPal { hi: RGB; base: RGB; sh: RGB; line: RGB; }
export const SKIN: Record<string, SkinPal> = {
  light: { hi: [255, 221, 189], base: [247, 201, 170], sh: [212, 158, 126], line: [168, 112, 82] },
  tan:   { hi: [232, 182, 136], base: [214, 162, 116], sh: [176, 126, 86],  line: [138, 92, 60] },
  brown: { hi: [180, 130, 94],  base: [158, 112, 78],  sh: [124, 86, 58],   line: [90, 60, 40] },
  dark:  { hi: [142, 98, 70],   base: [120, 80, 56],   sh: [94, 62, 42],    line: [64, 42, 28] },
};

function drawHead(buf: Buf, skin: string): void {
  const s = SKIN[skin] || SKIN.light;
  for (let y = 4; y <= 16; y++) {
    for (let x = HX0; x <= HX1; x++) {
      if (((x === HX0 || x === HX1) && (y === 4 || y === 5 || y === 16)) || ((x === 5 || x === 12) && y === 4)) continue;
      set(buf, x, y, s.base);
    }
  }
  for (let y = 6; y < 12; y++) set(buf, 5, y, s.hi);
  set(buf, 6, 5, s.hi); set(buf, 7, 5, s.hi);
  for (let y = 6; y < 15; y++) set(buf, 12, y, s.sh);
  for (const x of [7, 8, 9, 10, 11]) set(buf, x, 16, s.sh);
  for (const ex of [HX0 - 1, HX1 + 1]) { set(buf, ex, 9, s.base); set(buf, ex, 10, s.base); set(buf, ex, 11, s.sh); }
  rect(buf, 7, 17, 10, 18, s.sh); rect(buf, 7, 17, 9, 17, s.base);
}

export type HairStyle = 'messy' | 'short' | 'curly' | 'buzz' | 'ponytail' | 'long' | 'bald' | 'fade';

function drawHair(buf: Buf, style: HairStyle, color: RGB): void {
  const [hi, base, sh] = shades(color);
  if (style === 'short') {
    rect(buf, 4, 3, 13, 5, base);
    rect(buf, 5, 2, 12, 3, hi);
    rect(buf, 3, 4, 4, 8, sh);
    rect(buf, 13, 4, 14, 8, sh);
  } else if (style === 'messy') {
    rect(buf, 3, 2, 14, 5, base);
    rect(buf, 5, 1, 12, 3, hi);
    set(buf, 3, 1, hi); set(buf, 14, 2, sh);
    rect(buf, 3, 5, 4, 9, sh);
    rect(buf, 13, 5, 14, 9, sh);
  } else if (style === 'curly' || style === 'long') {
    rect(buf, 3, 2, 14, 6, base);
    rect(buf, 5, 1, 12, 3, hi);
    rect(buf, 2, 5, 4, 15, sh);
    rect(buf, 13, 5, 15, 15, sh);
  } else if (style === 'ponytail') {
    rect(buf, 4, 2, 13, 5, base);
    rect(buf, 14, 3, 16, 12, sh);
  } else if (style === 'bald') {
    rect(buf, 3, 8, 4, 12, sh);
    rect(buf, 13, 8, 14, 12, sh);
  } else {
    rect(buf, 4, 3, 13, 5, base);
    rect(buf, 3, 5, 4, 7, sh);
    rect(buf, 13, 5, 14, 7, sh);
  }
}

function drawFace(buf: Buf, skin: string, eyeColor: RGB = [50, 45, 60]): void {
  // Eyes
  set(buf, 6, 10, eyeColor);
  set(buf, 10, 10, eyeColor);
  // Nose
  const s = SKIN[skin] || SKIN.light;
  set(buf, 8, 12, s.sh);
  // Mouth
  set(buf, 7, 14, s.line);
  set(buf, 8, 14, s.line);
  set(buf, 9, 14, s.line);
}

function drawClothing(buf: Buf, clothColor: RGB, tieColor?: RGB): void {
  const [hi, base, sh] = shades(clothColor);
  rect(buf, 3, 19, 14, 27, base);
  rect(buf, 4, 19, 6, 26, hi);
  rect(buf, 11, 19, 13, 26, sh);
  // Collar
  rect(buf, 7, 19, 10, 20, [240, 240, 245]);
  if (tieColor) {
    rect(buf, 8, 20, 9, 25, tieColor);
  }
}

function drawLegs(buf: Buf, pantsColor: RGB, phase: number): void {
  const [hi, base, sh] = shades(pantsColor);
  // Left leg, Right leg
  if (phase === 1) { // step L
    rect(buf, 4, 27, 7, 31, hi);
    rect(buf, 10, 27, 13, 30, sh);
  } else if (phase === 2) { // step R
    rect(buf, 4, 27, 7, 30, sh);
    rect(buf, 10, 27, 13, 31, hi);
  } else { // stand
    rect(buf, 5, 27, 7, 31, base);
    rect(buf, 10, 27, 12, 31, base);
  }
}

function outlinePass(buf: Buf): void {
  const edges: [number, number][] = [];
  for (let y = 0; y < CUR_H; y++) {
    for (let x = 0; x < CUR_W; x++) {
      if (alphaAt(buf, x, y) === 0) continue;
      const neighbors = [
        alphaAt(buf, x - 1, y),
        alphaAt(buf, x + 1, y),
        alphaAt(buf, x, y - 1),
        alphaAt(buf, x, y + 1)
      ];
      if (neighbors.some(a => a === 0) || x === 0 || x === CUR_W - 1 || y === 0 || y === CUR_H - 1) {
        // Outline border pixel
      }
    }
  }
}

export interface CharacterRecipe {
  name: string;
  role: string;
  skin: string;
  hairStyle: HairStyle;
  hairColor: RGB;
  clothColor: RGB;
  tieColor?: RGB;
  pantsColor: RGB;
}

export function composeCharacterBust(recipe: CharacterRecipe): Uint8ClampedArray {
  CUR_W = PORTRAIT_W;
  CUR_H = PORTRAIT_H;
  const buf = new Uint8ClampedArray(PORTRAIT_W * PORTRAIT_H * 4);
  drawClothing(buf, recipe.clothColor, recipe.tieColor);
  drawHead(buf, recipe.skin);
  drawFace(buf, recipe.skin);
  drawHair(buf, recipe.hairStyle, recipe.hairColor);
  return buf;
}

export function composeCharacterScene(recipe: CharacterRecipe, phase: number, back = false): Uint8ClampedArray {
  CUR_W = SCENE_W;
  CUR_H = SCENE_H;
  const buf = new Uint8ClampedArray(SCENE_W * SCENE_H * 4);
  drawLegs(buf, recipe.pantsColor, phase);
  drawClothing(buf, recipe.clothColor, recipe.tieColor);
  drawHead(buf, recipe.skin);
  if (!back) {
    drawFace(buf, recipe.skin);
  }
  drawHair(buf, recipe.hairStyle, recipe.hairColor);
  return buf;
}

const bustCache = new Map<string, HTMLCanvasElement>();
const sceneFrameCache = new Map<string, HTMLCanvasElement[]>();

export function getCharacterBustCanvas(recipe: CharacterRecipe): HTMLCanvasElement {
  const key = recipe.name;
  if (bustCache.has(key)) return bustCache.get(key)!;
  const buf = composeCharacterBust(recipe);
  const canvas = document.createElement('canvas');
  canvas.width = PORTRAIT_W;
  canvas.height = PORTRAIT_H;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(PORTRAIT_W, PORTRAIT_H);
  imgData.data.set(buf);
  ctx.putImageData(imgData, 0, 0);
  bustCache.set(key, canvas);
  return canvas;
}

export function getCharacterSceneFrames(recipe: CharacterRecipe): { front: HTMLCanvasElement[]; back: HTMLCanvasElement[] } {
  const keyFront = `${recipe.name}_f`;
  const keyBack = `${recipe.name}_b`;
  
  if (sceneFrameCache.has(keyFront) && sceneFrameCache.has(keyBack)) {
    return {
      front: sceneFrameCache.get(keyFront)!,
      back: sceneFrameCache.get(keyBack)!,
    };
  }

  const createFrames = (back: boolean) => [0, 1, 2].map(phase => {
    const buf = composeCharacterScene(recipe, phase, back);
    const canvas = document.createElement('canvas');
    canvas.width = SCENE_W;
    canvas.height = SCENE_H;
    const ctx = canvas.getContext('2d')!;
    const imgData = ctx.createImageData(SCENE_W, SCENE_H);
    imgData.data.set(buf);
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  });

  const front = createFrames(false);
  const back = createFrames(true);
  sceneFrameCache.set(keyFront, front);
  sceneFrameCache.set(keyBack, back);
  return { front, back };
}
