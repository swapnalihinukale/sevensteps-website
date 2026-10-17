// Match global.css: border-box .wrap, clamped gutters, and its 1600px wider layout.
// Keep browser geometry coverage when those grid proportions or breakpoints change.
const normal = 'min(100vw, 1440px) - clamp(44px, 9vw, 176px)';
const wide = 'min(100vw, 1680px) - clamp(44px, 9vw, 176px)';
const length = (inner: string, fraction = 1, gap = 0) => `calc((${inner}${gap ? ` - ${gap}px` : ''}) * ${fraction})`;
const cap = (limit: number, value: string) => `min(${limit}px, ${value})`;

export const storyCoverSizes = `(min-width: 1600px) ${length(wide)}, ${length(normal)}`;
export function storyFrameSizes(index: number): string {
  if ((index + 1) % 3 === 0) return `(max-width: 720px) ${length(normal)}, (min-width: 1600px) ${length(wide, .76)}, ${length(normal, .76)}`;
  return `(max-width: 380px) ${length(normal)}, (max-width: 720px) ${length(normal, .5, 14)}, (min-width: 1600px) ${length(wide, .5, 28)}, ${length(normal, .5, 28)}`;
}
export const homeHeroSizes = `(max-width: 720px) ${length(normal)}, (max-width: 1000px) ${length(normal, .95 / 2.02)}, (min-width: 1600px) ${length(wide, .91 / 2.02)}, ${length(normal, .94 / 2.02)}`;
export const homeCompanionSizes = `(max-width: 380px) ${length(normal, .4)}, (max-width: 720px) ${cap(166.5, length(normal, .37))}, (max-width: 1000px) ${cap(176, length(normal, .95 * 1.02 / 2.02 * .4))}, (min-width: 1600px) ${cap(176, length(wide, .91 * 1.02 / 2.02 * .4))}, ${cap(176, length(normal, .94 * 1.02 / 2.02 * .4))}`;
export function workCoverSizes(index: number): string {
  const firstColumn = index % 2 === 0;
  const fraction = firstColumn ? .93 * 1.17 / 2.17 : .93 / 2.17;
  return `(max-width: 720px) ${length(normal, firstColumn ? .96 : .92)}, (min-width: 1600px) ${length(wide, fraction)}, ${length(normal, fraction)}`;
}
export const portraitSizes = `(max-width: 720px) ${cap(350, length(normal, .4))}, (max-width: 1000px) ${cap(350, length(normal, .93 * .8 / 2.05))}, (min-width: 1600px) ${cap(350, length(wide, .9 * .8 / 2.05))}, ${cap(350, length(normal, .9 * .8 / 2.05))}`;
