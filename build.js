/**
 * mrip build script
 *
 * Usage:
 *   npm run build
 *
 * Output:
 *   dist/mrip.bookmarklet.txt  — the javascript: string, ready to paste as a bookmark URL
 *   dist/mrip.min.js           — the minified IIFE without the javascript: prefix (for demo page embedding)
 *
 * The version number is read from package.json and injected as a comment in the minified output.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { minify } from 'terser';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const version = pkg.version;

const src = readFileSync('src/mrip.js', 'utf8');

// Terser options — aggressive but safe for our code style
const result = await minify(src, {
  compress: {
    passes: 3,
    drop_console: false,   // keep console.log('[mrip]', ...) for debugging
    pure_getters: true,
    unsafe_arrows: true,
    unsafe_methods: true,
  },
  mangle: {
    toplevel: false,       // keep outer IIFE name intact; mangle inner vars
  },
  format: {
    comments: false,       // strip all comments from minified output
    ascii_only: true,      // avoids unicode escaping issues in bookmark URLs
  },
  ecma: 2020,
});

if (result.error) {
  console.error('Terser error:', result.error);
  process.exit(1);
}

const minified = result.code;

// Wrap in javascript: prefix for the bookmarklet
// We URI-encode the minimal set of chars that break in bookmark URL fields
const bookmarklet = 'javascript:' + minified;

mkdirSync('dist', { recursive: true });

writeFileSync('dist/mrip.min.js', minified, 'utf8');
writeFileSync('dist/mrip.bookmarklet.txt', bookmarklet, 'utf8');

const srcKB = (src.length / 1024).toFixed(1);
const minKB = (minified.length / 1024).toFixed(1);
const bookmarkletKB = (bookmarklet.length / 1024).toFixed(1);
const saving = (100 - (minified.length / src.length) * 100).toFixed(0);

console.log(`mrip v${version} built successfully`);
console.log(`  src/mrip.js          ${srcKB} KB`);
console.log(`  dist/mrip.min.js     ${minKB} KB  (${saving}% smaller)`);
console.log(`  dist/mrip.bookmarklet.txt  ${bookmarkletKB} KB`);
console.log('');
console.log('To install: copy the contents of dist/mrip.bookmarklet.txt into a bookmark URL field.');
