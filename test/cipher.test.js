const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeShift, caesarShift } = require('../cipher.js');

test('known Caesar cipher answers preserve the documented behavior', () => {
  assert.equal(caesarShift('hello world.', 3), 'KHOOR ZRUOG.');
  assert.equal(caesarShift('hello world.', 3, { excludeNonAlpha: true }), 'KHOORZRUOG');
  assert.equal(caesarShift('Gallia est omnis divisa in partes tres.', 3), 'JDOOLD HVW RPQLV GLYLVD LQ SDUWHV WUHV.');
  assert.equal(caesarShift('HELLO', 13), 'URYYB');
  assert.equal(caesarShift('Attack at dawn!', 1), 'BUUBDL BU EBXO!');
  assert.equal(caesarShift('xyz', 3), 'ABC');
  assert.equal(caesarShift('hello world.', 0), 'HELLO WORLD.');
  assert.equal(caesarShift('hello world.', 25), 'GDKKN VNQKC.');
  assert.equal(caesarShift('KHOOR ZRUOG.', 3, { decrypt: true }), 'HELLO WORLD.');
  assert.equal(caesarShift(''), '');
});

test('normalizes shifts to integer values from zero through 25', () => {
  assert.equal(normalizeShift(-1), 25);
  assert.equal(normalizeShift(26), 0);
  assert.equal(normalizeShift(29), 3);
  assert.equal(normalizeShift('abc'), 0);
  assert.equal(normalizeShift(2.8), 2);
});

test('encrypting and decrypting round-trip across a broad shift range', () => {
  const plaintext = 'THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.';

  for (let shift = -30; shift <= 60; shift += 1) {
    const encrypted = caesarShift(plaintext, shift);
    assert.equal(caesarShift(encrypted, shift, { decrypt: true }), plaintext, `shift ${shift}`);
  }
});

test('decryption matches encryption with the complementary shift', () => {
  const ciphertext = 'KHOOR ZRUOG.';

  for (let shift = 0; shift < 26; shift += 1) {
    assert.equal(
      caesarShift(ciphertext, shift, { decrypt: true }),
      caesarShift(ciphertext, 26 - shift),
      `shift ${shift}`
    );
  }
});

test('ROT13 applied twice restores the original uppercase text', () => {
  assert.equal(caesarShift(caesarShift('Hello', 13), 13), 'HELLO');
});

test('uppercases input and preserves or excludes non-ASCII characters as specified', () => {
  assert.equal(caesarShift('hello', 1), 'IFMMP');
  assert.equal(caesarShift('aé😀b', 1), 'BÉ😀C');
  assert.equal(caesarShift('aé😀b', 1, { excludeNonAlpha: true }), 'BC');
  assert.equal(caesarShift('a 1!b', 1, { excludeNonAlpha: true }), 'BC');
});
