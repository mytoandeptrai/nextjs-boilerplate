/**
 * Regenerate every raster icon from the logo mark in `public/icon.svg`.
 *
 *   pnpm icons:generate
 *
 * Writes the favicon (`src/app/favicon.ico`), the PNG favicons, the Apple touch icon and the web app manifest
 * icons under `public/`. Run it again after editing `public/icon.svg`.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const source = await readFile(path.join(root, 'public/icon.svg'), 'utf8');

/** Square background to the edge (the platform cuts its own shape) and the artwork scaled around the centre. */
const fullBleed = (scale: number) =>
  source
    .replace(' rx="14"', '')
    .replace('<g id="art">', `<g id="art" transform="translate(32 32) scale(${scale}) translate(-32 -32)">`);

const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer();

/** An `.ico` holding PNG images, which every current browser reads. */
const ico = (images: { size: number; data: Buffer }[]) => {
  const header = Buffer.alloc(6 + images.length * 16);
  let offset = header.length;

  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16;

    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, ...images.map(({ data }) => data)]);
};

const files: [string, Buffer][] = [
  ['public/favicon-16x16.png', await png(source, 16)],
  ['public/favicon-32x32.png', await png(source, 32)],
  ['public/favicon-96x96.png', await png(source, 96)],
  ['public/android-chrome-192x192.png', await png(source, 192)],
  ['public/android-chrome-512x512.png', await png(source, 512)],
  // iOS rounds the corners itself and shows transparency as black.
  ['public/apple-touch-icon.png', await png(fullBleed(1.1), 180)],
  // Maskable icons may be cropped to a circle: the artwork stays inside the central 80%.
  ['public/web-app-manifest-192x192.png', await png(fullBleed(0.9), 192)],
  ['public/web-app-manifest-512x512.png', await png(fullBleed(0.9), 512)],
  [
    'src/app/favicon.ico',
    ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(source, size) })))),
  ],
];

for (const [file, data] of files) {
  await writeFile(path.join(root, file), data);
  console.log(`${file} (${data.length} bytes)`);
}
