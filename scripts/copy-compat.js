const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

// [distFileName, rootFileName]
const copies = [
  ['lazyloading.global.js', 'lazyloading.js'],
  ['lazyloading.min.global.js', 'lazyloading.min.js'],
  ['lazyloading.cjs.js', 'lazyloading.cjs.js'],
  ['lazyloading.cjs.min.js', 'lazyloading.cjs.min.js'],
  ['lazyloading.esm.js', 'lazyloading.esm.js'],
  ['lazyloading.esm.min.js', 'lazyloading.esm.min.js'],
];

for (const [from, to] of copies) {
  const src = path.join(dist, from);
  const dest = path.join(root, to);
  fs.copyFileSync(src, dest);
  console.log(`copied dist/${from} -> ${to}`);
}
