const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repositoryRoot, 'script.js'), 'utf8');

function escapeForRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('index applies the expected static security policy', () => {
  assert.match(html, /<meta\s+http-equiv=["']Content-Security-Policy["'][^>]*>/i);
  assert.doesNotMatch(html, /frame-ancestors/i);
  assert.match(html, /<meta\s+name=["']referrer["']\s+content=["']no-referrer["'][^>]*>/i);
  assert.match(html, /<meta\s+name=["']color-scheme["']\s+content=["']light dark["'][^>]*>/i);
});

test('index loads the cipher module before the user interface code', () => {
  assert.ok(html.indexOf('<script src="cipher.js">') < html.indexOf('<script src="script.js">'));
});

test('index contains no inline handlers or style attributes', () => {
  assert.doesNotMatch(html, /\son[a-z]+\s*=/i);
  assert.doesNotMatch(html, /\sstyle\s*=/i);
});

test('every explicit label target exists', () => {
  const labels = [...html.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["'][^>]*>/gi)];
  assert.ok(labels.length >= 2);

  for (const label of labels) {
    const id = escapeForRegex(label[1]);
    assert.match(html, new RegExp(`\\bid=["']${id}["']`, 'i'), `missing target for ${label[1]}`);
  }
});

test('the two switches are genuine checkbox inputs', () => {
  for (const id of ['showLines', 'excludeNonAlpha']) {
    const escapedId = escapeForRegex(id);
    const input = new RegExp(`<input\\b(?=[^>]*\\bid=["']${escapedId}["'])(?=[^>]*\\btype=["']checkbox["'])(?=[^>]*\\brole=["']switch["'])[^>]*>`, 'i');
    assert.match(html, input);
  }
});

test('new-tab links prevent opener access', () => {
  const links = html.match(/<a\b[^>]*\btarget=["']_blank["'][^>]*>/gi) || [];
  assert.ok(links.length >= 1);
  for (const link of links) {
    assert.match(link, /\brel=["'][^"']*\bnoopener\b[^"']*["']/i);
  }
});

test('the UI code avoids prohibited string insertion and copy fallbacks', () => {
  assert.ok(!script.includes('innerHTML'));
  assert.ok(!script.includes('execCommand'));
});
