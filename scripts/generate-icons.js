import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sourceImg = path.resolve('src/assets/images/pwa_app_icon_1786541108820.jpg');
const publicDir = path.resolve('public');
const iconsDir = path.join(publicDir, 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA Icons from source:', sourceImg);

  // 1. pwa-512x512.png
  await sharp(sourceImg)
    .resize(512, 512, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(sourceImg)
    .resize(512, 512, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(iconsDir, 'icon-512.png'));

  // 2. pwa-192x192.png
  await sharp(sourceImg)
    .resize(192, 192, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(sourceImg)
    .resize(192, 192, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(iconsDir, 'icon-192.png'));

  // 3. maskable-icon-512x512.png (padded by 10% for safe area)
  await sharp(sourceImg)
    .resize(410, 410, { fit: 'cover' })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a slate background
    })
    .toFormat('png')
    .toFile(path.join(publicDir, 'maskable-icon-512x512.png'));

  // 4. apple-touch-icon.png (180x180)
  await sharp(sourceImg)
    .resize(180, 180, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. favicon sizes (32x32, 16x16)
  await sharp(sourceImg)
    .resize(32, 32, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(sourceImg)
    .resize(16, 16, { fit: 'cover' })
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon-16x16.png'));

  // 6. Generate favicon.svg
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" rx="128" fill="#0f172a"/>
  <path d="M256 440C256 440 400 340 400 216C400 154.144 349.856 104 288 104C252.288 104 221.184 120.768 201.6 146.944C190.4 120.768 159.296 104 123.6 104C61.744 104 11.6 154.144 11.6 216C11.6 340 156 440 156 440" stroke="#0ea5e9" stroke-width="28" fill="none" stroke-linecap="round"/>
  <path d="M256 380 S360 290 360 190 C360 140 320 100 270 100 C240 100 215 115 200 138 C185 115 160 100 130 100 C80 100 40 140 40 190 C40 290 144 380 256 380 Z" fill="url(#grad)"/>
  <path d="M220 220 C220 160 280 140 320 170 C340 185 350 210 330 240 C310 270 250 300 220 220 Z" fill="#22c55e" opacity="0.9"/>
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
  </defs>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

  console.log('Successfully generated all PWA icons and SVG!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
