const fs = require('fs');
const path = require('path');

function walk(dir, ext, files=[]) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir,f);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, ext, files);
    else if (ext.includes(path.extname(full))) files.push(full);
  });
  return files;
}

const appDir = path.join(__dirname,'..','src','app');
const htmlTsFiles = walk(appDir, ['.html','.ts']);
const keyRegex = /'([a-z0-9_.]+)'\s*\|\s*translate/gi;
const keys = new Set();
for (const f of htmlTsFiles) {
  const content = fs.readFileSync(f,'utf8');
  let m;
  while ((m = keyRegex.exec(content)) !== null) {
    keys.add(m[1]);
  }
}

const localesDir = path.join(__dirname,'..','src','assets','i18n');
const enFile = path.join(localesDir,'en.json');
const esFile = path.join(localesDir,'es.json');
const en = JSON.parse(fs.readFileSync(enFile,'utf8'));
const es = JSON.parse(fs.readFileSync(esFile,'utf8'));

function hasKey(obj, key) {
  const parts = key.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return false;
  }
  return typeof cur === 'string' || typeof cur === 'object';
}

const missingEn = [];
const missingEs = [];
for (const k of keys) {
  if (!hasKey(en,k)) missingEn.push(k);
  if (!hasKey(es,k)) missingEs.push(k);
}

console.log('Found', keys.size, 'translate keys.');
console.log('Missing in en.json:', missingEn.length); if (missingEn.length) console.log(missingEn.join('\n'));
console.log('Missing in es.json:', missingEs.length); if (missingEs.length) console.log(missingEs.join('\n'));

// Optionally, add placeholders
function setDeep(obj, key, val) {
  const parts = key.split('.');
  let cur = obj;
  for (let i=0;i<parts.length-1;i++) {
    const p=parts[i]; if (!(p in cur)) cur[p]={}; cur = cur[p];
  }
  cur[parts[parts.length-1]] = val;
}

if (missingEn.length || missingEs.length) {
  console.log('Adding missing keys with placeholders...');
  for (const k of missingEn) {
    setDeep(en,k, k.split('.').pop().replace(/([A-Z])/g,' $1'));
  }
  for (const k of missingEs) {
    setDeep(es,k, k.split('.').pop().replace(/([A-Z])/g,' $1'));
  }
  fs.writeFileSync(enFile, JSON.stringify(en,null,2));
  fs.writeFileSync(esFile, JSON.stringify(es,null,2));
  console.log('Wrote', enFile, 'and', esFile);
} else {
  console.log('No missing keys.');
}
