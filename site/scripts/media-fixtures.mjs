import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

/** Geometric test inputs contain no people, customer work or external assets. */
export async function createMediaFixtures(sourceRoot) {
  await mkdir(sourceRoot, { recursive: true });
  const definitions = [
    { id: 'fixture-wide', width: 2400, height: 1600, source: 'wide.jpg', background: '#405B4B' },
    { id: 'fixture-tall', width: 1000, height: 1500, source: 'tall.jpg', background: '#722F46' },
    { id: 'fixture-square', width: 900, height: 900, source: 'square.png', background: '#E5E7E3' },
  ];
  for (const image of definitions) {
    const marks = Buffer.from(`<svg width="${image.width}" height="${image.height}" xmlns="http://www.w3.org/2000/svg"><rect x="${image.width * 0.07}" y="${image.height * 0.1}" width="${image.width * 0.28}" height="${image.height * 0.8}" fill="#FAFAF8"/><circle cx="${image.width * 0.7}" cy="${image.height * 0.42}" r="${Math.min(image.width, image.height) * 0.19}" fill="#242422"/><path d="M${image.width * 0.4} ${image.height * 0.84}L${image.width * 0.93} ${image.height * 0.62}" stroke="#FAFAF8" stroke-width="${image.width * 0.02}"/></svg>`);
    let output = sharp({ create: { width: image.width, height: image.height, channels: 3, background: image.background } }).composite([{ input: marks }]);
    output = image.source.endsWith('.png') ? output.png() : output.jpeg({ quality: 96 });
    await writeFile(resolve(sourceRoot, image.source), await output.toBuffer());
  }
  return definitions.map(image => ({
    id: image.id, source: image.source,
    alt: `Synthetic test image: ${image.id === 'fixture-wide' ? 'wide green' : image.id === 'fixture-tall' ? 'tall pomegranate' : 'square pale'} composition with a rectangle, circle and line.`,
    caption: 'Synthetic image for testing the website. Replace with cleared portfolio work.',
    credit: 'Website test fixture', kind: 'synthetic', publicationCleared: false,
    focalPoint: { x: 0.7, y: 0.42 },
  }));
}
