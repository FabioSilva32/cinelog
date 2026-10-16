import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Exact CineLog Film Reel SVG from the site
const fullIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="#000000"/>
  <g transform="translate(106, 106) scale(12.5)" stroke="#e50914" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="2.2" ry="2.2"/>
    <line x1="7" x2="7" y1="2" y2="22"/>
    <line x1="17" x2="17" y1="2" y2="22"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="2" x2="7" y1="7" y2="7"/>
    <line x1="17" x2="22" y1="7" y2="7"/>
    <line x1="17" x2="22" y1="17" y2="17"/>
    <line x1="2" x2="7" y1="17" y2="17"/>
  </g>
</svg>
`;

// Adaptive Foreground SVG (Transparent background, centered red logo inside safe zone)
const foregroundSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(131, 131) scale(10.4)" stroke="#e50914" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="2.2" ry="2.2"/>
    <line x1="7" x2="7" y1="2" y2="22"/>
    <line x1="17" x2="17" y1="2" y2="22"/>
    <line x1="2" x2="22" y1="12" y2="12"/>
    <line x1="2" x2="7" y1="7" y2="7"/>
    <line x1="17" x2="22" y1="7" y2="7"/>
    <line x1="17" x2="22" y1="17" y2="17"/>
    <line x1="2" x2="7" y1="17" y2="17"/>
  </g>
</svg>
`;

const resDir = path.resolve('android/app/src/main/res');

const MIPMAP_SIZES = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function generate() {
  const fullBuffer = Buffer.from(fullIconSvg);
  const fgBuffer = Buffer.from(foregroundSvg);

  for (const item of MIPMAP_SIZES) {
    const targetDir = path.join(resDir, item.folder);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // 1. Legacy Launcher Icon (Full solid black with red logo)
    await sharp(fullBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // 2. Round Launcher Icon
    await sharp(fullBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // 3. Adaptive Foreground Icon (Transparent with red logo)
    await sharp(fgBuffer)
      .resize(item.fgSize, item.fgSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${item.folder}`);
  }

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
