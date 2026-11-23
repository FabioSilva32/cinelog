import sharp from 'sharp';
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root = new URL('../public/', import.meta.url);
const svg = await readFile(new URL('favicon.svg', root));
// Preserve the site's red filmstrip mark; pad installed icons into a safe area.
for (const [name, size] of [['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  const inset = Math.round(size * .18);
  const mark = await sharp(svg).resize(size - inset * 2).png().toBuffer();
  await sharp({create: {width: size, height: size, channels: 4, background: '#0b0b0b'}})
    .composite([{input: mark, gravity: 'centre'}]).png().toFile(fileURLToPath(new URL(name, root)));
}
// ICO with PNG entries supports browsers requesting the conventional /favicon.ico.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(size => sharp(svg).resize(size).png().toBuffer()));
const directory = Buffer.alloc(6 + 16 * images.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory[entry] = directory[entry + 1] = sizes[index];
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});
await writeFile(new URL('favicon.ico', root), Buffer.concat([directory, ...images]));
console.log('Generated red web icons: ICO, Apple touch, 192px and 512px.');
