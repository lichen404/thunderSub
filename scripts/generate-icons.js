/**
 * Generate app icons for ThunderSub
 *
 * Converts assets/icon.svg to:
 *   - assets/icon.png   (512×512, for electron-builder app icon)
 *   - assets/icon.ico   (Windows ICO, for NSIS installer)
 *   - assets/icon.icns  (macOS ICNS, for .dmg app icon)
 *
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');

/**
 * Create a minimal .icns file containing a single ic07 (128x128) PNG entry.
 * Full .icns can have multiple sizes; this covers Retina @1x display.
 */
function createIcns(png128Buffer, png256Buffer) {
  const icons = [
    { type: 'ic07', data: png128Buffer }, // 128×128
    { type: 'ic08', data: png256Buffer }  // 256×256
  ];

  let body = Buffer.alloc(0);
  for (const icon of icons) {
    const entry = icon.data;
    const header = Buffer.alloc(8);
    header.write(icon.type, 0, 4, 'ascii');      // OSType
    header.writeUInt32BE(8 + entry.length, 4);    // entry length
    body = Buffer.concat([body, header, entry]);
  }

  const totalSize = 8 + body.length;
  const header = Buffer.alloc(8);
  header.write('icns', 0, 4, 'ascii');            // magic
  header.writeUInt32BE(totalSize, 4);              // total file size

  return Buffer.concat([header, body]);
}

/**
 * Create a .ico file from a PNG buffer.
 */
function createIco(pngBuffer) {
  const pngSize = pngBuffer.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);       // reserved
  header.writeUInt16LE(1, 2);       // ICO type
  header.writeUInt16LE(1, 4);       // 1 image

  const entry = Buffer.alloc(16);
  entry.writeUInt8(0, 0);           // width (0 = 256)
  entry.writeUInt8(0, 1);           // height (0 = 256)
  entry.writeUInt8(0, 2);           // colors
  entry.writeUInt8(0, 3);           // reserved
  entry.writeUInt16LE(1, 4);        // planes
  entry.writeUInt16LE(32, 6);       // bpp
  entry.writeUInt32LE(pngSize, 8);  // image size
  entry.writeUInt32LE(22, 12);      // offset (header 6 + entry 16 = 22)

  return Buffer.concat([header, entry, pngBuffer]);
}

async function main() {
  console.log('🔧 Generating app icons...\n');

  // Ensure assets directory exists
  fs.mkdirSync(ASSETS, { recursive: true });

  // Check if sharp is available
  try {
    require.resolve('sharp');
  } catch {
    console.log('📦 sharp not found — installing...');
    require('child_process').execSync('npm install --no-save sharp', {
      cwd: ASSETS,
      stdio: 'inherit'
    });
  }

  const sharp = require('sharp');

  const svgBuffer = fs.readFileSync(path.join(ASSETS, 'icon.svg'));

  // 512×512 PNG for electron-builder app icon
  console.log('  → assets/icon.png (512×512)');
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(ASSETS, 'icon.png'));

  // 256×256 PNG → ICO for NSIS installer
  console.log('  → assets/icon.ico (256×256)');
  const png256 = await sharp(svgBuffer)
    .resize(256, 256)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(ASSETS, 'icon.ico'), createIco(png256));

  // 128×128 & 256×256 PNG → ICNS for macOS
  console.log('  → assets/icon.icns (128×128 + 256×256)');
  const png128 = await sharp(svgBuffer)
    .resize(128, 128)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(ASSETS, 'icon.icns'), createIcns(png128, png256));

  console.log('\n✅ Done!');
  console.log('   - assets/icon.png  (app icon)');
  console.log('   - assets/icon.ico  (Windows installer icon)');
  console.log('   - assets/icon.icns (macOS app icon)');
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
