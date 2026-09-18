(function (root) {
  'use strict';

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function normalizeShift(shift) {
    const numericShift = Number(shift);
    if (!Number.isFinite(numericShift)) {
      return 0;
    }

    const integerShift = Math.trunc(numericShift);
    return ((integerShift % 26) + 26) % 26;
  }

  function caesarShift(text, shift, { decrypt = false, excludeNonAlpha = false } = {}) {
    const normalizedShift = normalizeShift(shift);
    const upperText = String(text ?? '').toUpperCase();
    const sourceText = excludeNonAlpha ? upperText.replace(/[^A-Z]/g, '') : upperText;
    const direction = decrypt ? -1 : 1;

    return sourceText.replace(/[A-Z]/g, character => {
      const index = ALPHABET.indexOf(character);
      const shiftedIndex = (index + direction * normalizedShift + 26) % 26;
      return ALPHABET[shiftedIndex];
    });
  }

  const CaesarCipher = { ALPHABET, normalizeShift, caesarShift };
  root.CaesarCipher = CaesarCipher;

  if (typeof module === 'object' && module.exports) {
    module.exports = CaesarCipher;
  }
})(globalThis);
