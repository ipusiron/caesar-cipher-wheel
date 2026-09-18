const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { caesarShift } = require('../cipher.js');

const repositoryRoot = path.resolve(__dirname, '..');
const readme = fs.readFileSync(path.join(repositoryRoot, 'README.md'), 'utf8');

function removeCodeTicks(value) {
  return value.trim().replace(/^`|`$/g, '');
}

test('README encryption examples agree with the cipher implementation', () => {
  const pairs = [...readme.matchAll(/> 【平文】([^\r\n]+)[\s\S]*?> 【暗号文】([^\r\n]+)/g)];
  assert.ok(pairs.length >= 1, 'README must contain at least one plaintext/ciphertext pair');

  for (const pair of pairs) {
    assert.equal(caesarShift(pair[1].trim(), 3), pair[2].trim());
  }
});

test('README usage table agrees with the cipher implementation', () => {
  const heading = '### 使い方の例';
  const start = readme.indexOf(heading);
  assert.notEqual(start, -1, 'README must contain the usage examples table');

  const nextHeading = readme.indexOf('\n## ', start + heading.length);
  const section = readme.slice(start, nextHeading === -1 ? undefined : nextHeading);
  const rows = section.split(/\r?\n/)
    .filter(line => line.startsWith('|'))
    .map(line => line.slice(1, -1).split('|').map(cell => cell.trim()))
    .filter(cells => cells[0] !== '入力' && !cells.every(cell => /^:?-{3,}:?$/.test(cell)));

  assert.ok(rows.length >= 1, 'README usage examples table must contain data rows');

  for (const [input, shift, mode, exclude, result] of rows) {
    assert.equal(
      caesarShift(removeCodeTicks(input), Number(shift), {
        decrypt: mode === '復号',
        excludeNonAlpha: exclude === 'ON'
      }),
      removeCodeTicks(result),
      `README row for ${input}`
    );
  }
});

test('all relative README image references exist', () => {
  const imageReferences = [...readme.matchAll(/!\[[^\]]*\]\(([^\s)]+)(?:\s+[^)]*)?\)/g)]
    .map(match => match[1])
    .filter(reference => !/^(?:https?:|#)/i.test(reference));

  assert.ok(imageReferences.length >= 2, 'README must reference both current screenshots');
  for (const reference of imageReferences) {
    assert.ok(fs.existsSync(path.join(repositoryRoot, reference)), `missing README image: ${reference}`);
  }
});
