# TypeScript Source Migration — Design

## Goal

Migrate `vtex-lazyloading` from hand-maintained plain-JS build artifacts to a
TypeScript source (`src/`) that compiles to the JS artifacts consumers
already depend on (CommonJS, ESM, browser global + minified variants),
while giving TypeScript consumers proper type definitions on import.

## Current state

- No `src/`, no build tooling, no `tsconfig`. Root contains hand-authored/
  hand-built JS files: `lazyloading.js`, `lazyloading.cjs.js`,
  `lazyloading.esm.js`, `lazyloading.min.js`, `lazyloading.cjs.min.js`,
  `lazyloading.esm.min.js`.
- Public API: `function VtexLazyload(_options)` used as a constructor
  (`new VtexLazyload({...})`), exported as CJS default (`module.exports`),
  ESM default (`export default`), and as a bare global for the `<script>`/CDN
  use case (`lazyloading.min.js`).
- Options: `root`, `targets`, `margin`, `onRender`, `placeholder`.
- Methods: `update()`, `reinit()`, `destroy()`, `destroyInElement(selector)`.
- `package.json` `exports` map currently only serves the browser-minified
  build; `main`/`module` point at the unminified cjs/esm files.

## Approach

1. **Source**: `src/index.ts` — `VtexLazyload` rewritten as an ES6 class
   (external API unchanged: `new VtexLazyload(options)`, same methods).
   Add a `VtexLazyloadOptions` interface and type the internal DOM-handling
   logic (elements are `HTMLElement`/`Element`, options nullable fields
   explicit). Logic is a straight port of the existing implementation —
   no behavior changes.
2. **Build tool**: `tsup` (esbuild-based). One config
   (`tsup.config.ts`) producing:
   - `dist/lazyloading.cjs.js` (CJS)
   - `dist/lazyloading.esm.js` (ESM)
   - `dist/lazyloading.global.js` (IIFE, browser global `VtexLazyload`, for CDN/`<script>` use — replaces current `lazyloading.js`/`lazyloading.min.js` role)
   - minified counterpart of each (`.min.js`)
   - `dist/index.d.ts` (type declarations, via tsup's `dts: true`)
   - sourcemaps for all
3. **tsconfig.json**: `strict: true`, `target: ES2017` (matches current
   browser support implied by `IntersectionObserver` feature-detection
   fallback), `module: ESNext`, `moduleResolution: Bundler`.
4. **package.json**:
   - `main`: `dist/lazyloading.cjs.js`
   - `module`: `dist/lazyloading.esm.js`
   - `types`: `dist/index.d.ts`
   - `exports` map with `types` / `import` / `require` / `browser`
     conditions, `browser` condition still pointing at the minified global
     build (preserves current CDN usage), `types` first so TS consumers
     resolve declarations.
   - `files` field includes `dist` **and** the root-level `lazyloading*.js`
     compat copies (+ `README.md`, `LICENSE`) — `src/` and config files are
     excluded from the npm tarball, but the root filenames stay published.
   - `scripts.build`: `tsup && npm run build:compat`; `build:compat` copies
     the generated `dist/lazyloading.global.js` /
     `dist/lazyloading.global.min.js` /  `dist/lazyloading.cjs.js` /
     `dist/lazyloading.esm.js` (+ `.min` counterparts) back to the repo
     root under their existing filenames (`lazyloading.js`,
     `lazyloading.min.js`, `lazyloading.cjs.js`, `lazyloading.esm.js`,
     `lazyloading.cjs.min.js`, `lazyloading.esm.min.js`), so the CDN URL
     documented in README (`.../vtex-lazyloading/lazyloading.min.js`)
     keeps resolving unchanged after publish.
   - Add `typescript` and `tsup` as `devDependencies`.
5. **.gitignore**: add `dist/`, `node_modules/`. The root-level
   `lazyloading*.js` files remain tracked, but become build output (written
   by `npm run build`, not hand-edited) instead of the source of truth —
   `src/index.ts` is now canonical. A committed root `.js` file that's out
   of sync with `src/` is a bug, not a valid edit target.
6. **README**: update install/usage section to show the typed import
   (`import VtexLazyload from 'vtex-lazyloading'` with `VtexLazyloadOptions`
   available) alongside the unchanged CDN `<script>` usage.

## Out of scope

- No behavior/feature changes to the lazyload logic itself.
- No test suite added (none exists today; not part of this migration).
- No CI/publish pipeline changes beyond the `prepublishOnly` build hook.

## Risks / notes

- Root-level `.js` filenames are kept (as build output copies) specifically
  so the existing unpinned CDN URL in README
  (`cdn.jsdelivr.net/npm/vtex-lazyloading/lazyloading.min.js`) keeps
  resolving after this change ships. If a future change drops the
  `build:compat` copy step, that URL breaks for anyone not pinning a
  version — treat removing it as a deliberate breaking change, not cleanup.
- Two copies of build output now exist (`dist/` gitignored, root tracked).
  This is intentional duplication for CDN backward-compat, not drift to
  "fix" by deleting one side.
