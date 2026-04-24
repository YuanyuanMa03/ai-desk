import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const buildDir = join(root, "build");
const iconsetDir = join(buildDir, "AI Desk.iconset");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="232" fill="url(#bg)"/>
  <rect x="92" y="92" width="840" height="840" rx="194" fill="white" fill-opacity="0.36"/>
  <rect x="176" y="178" width="672" height="668" rx="168" fill="url(#glass)" stroke="white" stroke-width="18"/>
  <path d="M322 634C322 500.899 429.899 393 563 393H662C686.853 393 707 413.147 707 438V568C707 716.504 586.504 837 438 837H367C342.147 837 322 816.853 322 792V634Z" fill="url(#panel)" fill-opacity="0.92"/>
  <path d="M313 277C313 227.294 353.294 187 403 187H657C681.853 187 702 207.147 702 232V322C702 371.706 661.706 412 612 412H358C333.147 412 313 391.853 313 367V277Z" fill="white" fill-opacity="0.84"/>
  <path d="M398 286H604" stroke="#253141" stroke-width="42" stroke-linecap="round"/>
  <path d="M398 502H600" stroke="white" stroke-width="42" stroke-linecap="round"/>
  <path d="M398 604H544" stroke="white" stroke-width="42" stroke-linecap="round"/>
  <circle cx="692" cy="278" r="116" fill="url(#orb)" stroke="white" stroke-width="18"/>
  <path d="M692 222V334M636 278H748" stroke="white" stroke-width="34" stroke-linecap="round"/>
  <defs>
    <linearGradient id="bg" x1="128" y1="70" x2="860" y2="934" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F9FBFF"/>
      <stop offset="0.42" stop-color="#DDEAF4"/>
      <stop offset="1" stop-color="#F7F4EC"/>
    </linearGradient>
    <linearGradient id="glass" x1="224" y1="188" x2="790" y2="824" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFFFFF" stop-opacity="0.82"/>
      <stop offset="1" stop-color="#EEF6FB" stop-opacity="0.58"/>
    </linearGradient>
    <linearGradient id="panel" x1="376" y1="420" x2="707" y2="806" gradientUnits="userSpaceOnUse">
      <stop stop-color="#4F8EC3"/>
      <stop offset="1" stop-color="#253141"/>
    </linearGradient>
    <linearGradient id="orb" x1="610" y1="172" x2="778" y2="380" gradientUnits="userSpaceOnUse">
      <stop stop-color="#8BD6FF"/>
      <stop offset="1" stop-color="#4C6FFF"/>
    </linearGradient>
  </defs>
</svg>`;

const androidSizes = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192]
];

const iosIconPath = join(
  root,
  "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
);

async function writePng(path, size) {
  await mkdir(dirname(path), { recursive: true });
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path);
}

await mkdir(buildDir, { recursive: true });
await writeFile(join(buildDir, "icon.svg"), svg);
await writePng(join(buildDir, "icon.png"), 1024);

await mkdir(iconsetDir, { recursive: true });
for (const [name, size] of [
  ["icon_16x16.png", 16],
  ["icon_16x16@2x.png", 32],
  ["icon_32x32.png", 32],
  ["icon_32x32@2x.png", 64],
  ["icon_128x128.png", 128],
  ["icon_128x128@2x.png", 256],
  ["icon_256x256.png", 256],
  ["icon_256x256@2x.png", 512],
  ["icon_512x512.png", 512],
  ["icon_512x512@2x.png", 1024]
]) {
  await writePng(join(iconsetDir, name), size);
}

// Generate multi-size ICO for best Windows rendering across all contexts
// (taskbar, desktop, file explorer, window title bar)
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoPngPaths = [];
for (const size of icoSizes) {
  const p = join(buildDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg)).resize(size, size).png().toFile(p);
  icoPngPaths.push(p);
}
await writeFile(join(buildDir, "icon.ico"), await pngToIco(icoPngPaths));

await writePng(iosIconPath, 1024);
for (const [folder, size] of androidSizes) {
  await writePng(join(root, `android/app/src/main/res/${folder}/ic_launcher.png`), size);
  await writePng(join(root, `android/app/src/main/res/${folder}/ic_launcher_round.png`), size);
  await writePng(join(root, `android/app/src/main/res/${folder}/ic_launcher_foreground.png`), size);
}

console.log("Generated AI Desk icon assets.");
