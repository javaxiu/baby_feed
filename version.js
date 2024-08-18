import fs from 'fs';

const content = fs.readFileSync('./src-tauri/tauri.conf.json', { encoding: 'utf8' });
const json = JSON.parse(content);
const vl = json.version.split('.').map(Number);
vl[vl.length - 1] += 1;

json.version = vl.join('.');

fs.writeFileSync(
  './src-tauri/tauri.conf.json', 
  JSON.stringify(json, null, 2)
);