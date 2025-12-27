const fs = require('fs');
const path = require('path');

function hexToRgb(hex) {
  hex = hex.replace('#','');
  if (hex.length === 3) hex = hex.split('').map(s=>s+s).join('');
  const num = parseInt(hex,16);
  return [(num>>16)&255, (num>>8)&255, num&255];
}

function parseColor(value) {
  value = value.trim();
  if (value.startsWith('#')) return hexToRgb(value);
  // very small support for rgb() only
  const m = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  return null;
}

function relativeLuminance(rgb) {
  // rgb: [r,g,b] 0-255
  const srgb = rgb.map(c => c/255).map(c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4));
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function contrastRatio(rgb1, rgb2) {
  const L1 = relativeLuminance(rgb1);
  const L2 = relativeLuminance(rgb2);
  const lighter = Math.max(L1,L2);
  const darker = Math.min(L1,L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const stylesPath = path.resolve(__dirname, '..', 'src', 'styles.scss');
const content = fs.readFileSync(stylesPath, 'utf8');

// Find :root block and extract --var: value;
const rootMatch = content.match(/:root\s*\{([\s\S]*?)\}/);
if (!rootMatch) {
  console.error('No :root block found in styles.scss');
  process.exit(1);
}
const rootBody = rootMatch[1];
const varRegex = /--([a-zA-Z0-9\-]+)\s*:\s*([^;]+);/g;
let m;
const vars = {};
while ((m = varRegex.exec(rootBody)) !== null) {
  vars[m[1]] = m[2].trim();
}

// Select pairs to check
const checks = [
  { name: 'text on surface', fg: 'text-primary', bg: 'color-surface', min: 4.5 },
  { name: 'secondary text on surface', fg: 'text-secondary', bg: 'color-surface', min: 4.5 },
  { name: 'primary on surface (button)', fg: 'color-surface', bg: 'color-primary', min: 3 },
  { name: 'accent on surface', fg: 'color-surface', bg: 'color-accent', min: 3 },
  { name: 'primary-700 on surface', fg: 'color-surface', bg: 'color-primary-700', min: 3 }
];

const results = [];
for (const c of checks) {
  const fgVal = vars[c.fg];
  const bgVal = vars[c.bg];
  if (!fgVal || !bgVal) {
    results.push({ check: c.name, ok: false, reason: `Missing var ${!fgVal?c.fg:c.bg}` });
    continue;
  }
  const fgRgb = parseColor(fgVal.replace(/\bvar\((--[a-zA-Z0-9\-]+)\)\b/, (s,p)=>{ return vars[p.replace('--','')] || s;}));
  const bgRgb = parseColor(bgVal.replace(/\bvar\((--[a-zA-Z0-9\-]+)\)\b/, (s,p)=>{ return vars[p.replace('--','')] || s;}));
  if (!fgRgb || !bgRgb) {
    results.push({ check: c.name, ok: false, reason: 'Unsupported color format', fg: fgVal, bg: bgVal });
    continue;
  }
  const ratio = contrastRatio(fgRgb, bgRgb);
  results.push({ check: c.name, ratio: Math.round(ratio*100)/100, ok: ratio >= c.min, min: c.min, fg: fgVal, bg: bgVal });
}

console.log('WCAG contrast check results:');
results.forEach(r => {
  if (r.ok) {
    console.log(`  ✓ ${r.check}: ${r.ratio} (>= ${r.min})`);
  } else {
    console.log(`  ✗ ${r.check}: ${r.ratio || 'n/a'}  — ${r.reason || `needs >= ${r.min}`}`);
  }
});

const failures = results.filter(r => !r.ok);
if (failures.length) {
  console.log('\nSummary: Found contrast issues. Recommend adjusting variables or using darker/lighter tones where needed.');
  process.exit(2);
} else {
  console.log('\nAll checked pairs pass the thresholds.');
  process.exit(0);
}