const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');

// tsup/esbuild emit `module.exports = { default: VtexLazyload }` for a
// TS default export compiled to CJS. Consumers of this package expect
// `require('vtex-lazyloading')` to return the class directly (the
// original hand-written `module.exports = VtexLazyload`), so unwrap it.
const files = ['lazyloading.cjs.js', 'lazyloading.cjs.min.js'];

for (const file of files) {
  const filePath = path.join(dist, file);
  const contents = fs.readFileSync(filePath, 'utf8');
  fs.writeFileSync(filePath, `${contents}\nmodule.exports = module.exports.default;\n`);
  console.log(`fixed cjs export shape: ${file}`);
}
