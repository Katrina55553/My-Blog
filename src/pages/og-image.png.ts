import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>
        <radialGradient id="paper" cx="18%" cy="12%" r="105%">
          <stop offset="0" stop-color="#fffaf0"/>
          <stop offset="1" stop-color="#e9ddc8"/>
        </radialGradient>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="7"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer><feFuncA type="table" tableValues="0 0.055"/></feComponentTransfer>
        </filter>
      </defs>
      <rect width="1200" height="630" fill="url(#paper)"/>
      <rect width="1200" height="630" filter="url(#grain)" opacity="0.55"/>
      <line x1="74" y1="72" x2="1126" y2="72" stroke="#c7bb9e" stroke-width="2"/>
      <line x1="74" y1="558" x2="1126" y2="558" stroke="#c7bb9e" stroke-width="2"/>
      <rect x="78" y="130" width="106" height="106" rx="7" fill="#b8412c"/>
      <text x="131" y="205" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-weight="700" fill="#f4ede0">K</text>
      <text x="78" y="340" font-family="Georgia, serif" font-size="78" font-weight="700" fill="#1c1814">Katrina’s Journal</text>
      <text x="81" y="410" font-family="Georgia, serif" font-size="34" font-style="italic" fill="#6b5d4f">Code, books &amp; notes from the margins</text>
      <line x1="81" y1="456" x2="310" y2="456" stroke="#b8412c" stroke-width="5"/>
      <circle cx="1090" cy="498" r="34" fill="none" stroke="#b8412c" stroke-width="4"/>
      <text x="1090" y="508" text-anchor="middle" font-family="Georgia, serif" font-size="28" font-weight="700" fill="#b8412c">K</text>
    </svg>`;

  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
