export async function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#020617"/>
    <text x="60" y="280" font-family="Georgia, serif" font-size="64" fill="#e2e8f0">Katrina's blog</text>
    <text x="60" y="350" font-family="sans-serif" font-size="28" fill="#64748b">
      写代码、读读书、记录生活
    </text>
    <line x1="60" y1="390" x2="280" y2="390" stroke="#22d3ee" stroke-width="3"/>
  </svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml' },
  });
}
