const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');

// tsup/esbuild emit a TS `export default class` as `{ default: VtexLazyload }`
// for both the CJS and IIFE (browser global) builds. Consumers expect the
// class directly (the original hand-written `module.exports = VtexLazyload`
// / global `VtexLazyload` constructor), so unwrap `.default` in place.
const cjsFiles = ['lazyloading.cjs.js', 'lazyloading.cjs.min.js'];
const globalFiles = ['lazyloading.global.js', 'lazyloading.min.global.js'];

for (const file of cjsFiles) {
  const filePath = path.join(dist, file);
  const contents = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, `${contents}\nmodule.exports = module.exports.default;\n`);
  console.log(`fixed cjs export shape: ${file}`);
}

for (const file of globalFiles) {
  const filePath = path.join(dist, file);
  const contents = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, `${contents}\nVtexLazyload = VtexLazyload.default;\n`);
  console.log(`fixed global export shape: ${file}`);
}
