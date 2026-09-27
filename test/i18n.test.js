const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const I18n = require(path.join(repositoryRoot, 'i18n.js'));
const html = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(repositoryRoot, 'script.js'), 'utf8');

test('日本語と英語で、キーの集合が同じ', () => {
  const ja = Object.keys(I18n.ja).sort();
  const en = Object.keys(I18n.en).sort();
  assert.deepEqual(ja.filter((k) => !(k in I18n.en)), [], '英語に無いキーがある');
  assert.deepEqual(en.filter((k) => !(k in I18n.ja)), [], '日本語に無いキーがある');
});

test('差し込みの名前が、日本語と英語で一致する', () => {
  const holes = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
  const mismatched = Object.keys(I18n.ja).filter((k) => holes(I18n.ja[k]) !== holes(I18n.en[k]));
  assert.deepEqual(mismatched, []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(m[1]);
  assert.ok(keys.size >= 15, `data-i18n が少なすぎる: ${keys.size}`);
  assert.deepEqual([...keys].filter((k) => !(k in I18n.ja)), []);
});

test('script.js が呼ぶキーは、すべて辞書にある', () => {
  const keys = new Set();
  for (const m of script.matchAll(/I18n\.t\(\s*['"]([\w.]+)['"]/g)) keys.add(m[1]);
  for (const m of script.matchAll(/['"]((?:disk|theme)\.[a-zA-Z]+)['"]/g)) keys.add(m[1]);
  assert.ok(keys.size > 0, 'I18n.t の呼び出しが見つからない');
  assert.deepEqual([...keys].filter((k) => !(k in I18n.ja)), []);
});

test('英語の辞書に、訳し忘れの日本語が残っていない', () => {
  const jp = /[぀-ヿ一-鿿]/;
  // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
  const expected = new Set(['app.langButton']);
  assert.deepEqual(Object.keys(I18n.en).filter((k) => !expected.has(k) && jp.test(I18n.en[k])), []);
});

test('t() は差し込みを埋める。知らないキーは黙って通さない', () => {
  assert.match(I18n.t('disk.encrypt', { shift: 3, letter: 'D' }), /3/);
  assert.match(I18n.t('disk.encrypt', { shift: 3, letter: 'D' }), /D/);
  assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
});

test('「まだ何も無い」の判定を、文言の一致で行っていない', () => {
  // 言語を変えると文字列が変わるため、data-empty の印で見分ける
  assert.doesNotMatch(script, /outputText === ['"]Enter text above/);
  assert.match(script, /dataset\.empty/);
});

test('i18n.js を先に読み込む', () => {
  assert.ok(html.indexOf('<script src="i18n.js">') < html.indexOf('<script src="cipher.js">'));
});
