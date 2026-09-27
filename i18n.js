// 日本語と英語のメッセージ。UI側のスクリプトは言語ごとの文字列を持たない。
const I18n = (() => {
  const ja = {
    'app.title': 'シーザー暗号の円盤',
    'app.description': '回る円盤でシーザー暗号を試すツール。ずらす数を変えると、文字の対応がその場で見えます。',
    'app.langButton': 'English',
    'app.langAria': '言語を切り替える',
    'theme.toDark': 'ダークモードに切り替える',
    'theme.toLight': 'ライトモードに切り替える',
    'input.label': '暗号化または復号する文',
    'input.placeholder': 'ここに文を入れてください',
    'shift.label': 'ずらす数',
    'shift.aria': 'ずらす数',
    'mode.legend': '変換の向き',
    'mode.encrypt': '暗号化',
    'mode.decrypt': '復号',
    'toggle.lines': '対応する線を引く',
    'toggle.exclude': '空白と記号は変えない',
    'output.label': '結果',
    'output.empty': '上に文を入れると、ここに結果が出ます',
    'copy.title': 'クリップボードへコピー',
    'copy.aria': '結果をクリップボードへコピー',
    'copy.done': 'コピーしました',
    'copy.failed': 'コピーできませんでした',
    'disk.encrypt': 'ずらす数 {shift}、暗号化：A は {letter} になります',
    'disk.decrypt': 'ずらす数 {shift}、復号：A は {letter} になります',
    'footer.repo': '🔗 GitHubリポジトリはこちら（',
    'footer.repoEnd': '）',
    'noscript': 'このツールにはJavaScriptが要ります。'
  };

  const en = {
    'app.title': 'Caesar Cipher Wheel Tool',
    'app.description': 'Interactive Caesar cipher wheel: encrypt and decrypt with a rotating cipher disk',
    'app.langButton': '日本語',
    'app.langAria': 'Switch language',
    'theme.toDark': 'Switch to dark mode',
    'theme.toLight': 'Switch to light mode',
    'input.label': 'Text to encrypt or decrypt',
    'input.placeholder': 'Enter your message here...',
    'shift.label': 'Shift',
    'shift.aria': 'Shift value',
    'mode.legend': 'Cipher mode',
    'mode.encrypt': 'Encrypt',
    'mode.decrypt': 'Decrypt',
    'toggle.lines': 'Show correspondence lines',
    'toggle.exclude': 'Exclude spaces and symbols',
    'output.label': 'Result',
    'output.empty': 'Enter text above to see the result',
    'copy.title': 'Copy to clipboard',
    'copy.aria': 'Copy result to clipboard',
    'copy.done': 'Copied',
    'copy.failed': 'Copy failed',
    'disk.encrypt': 'Shift {shift}, encrypt mode: A maps to {letter}',
    'disk.decrypt': 'Shift {shift}, decrypt mode: A maps to {letter}',
    'footer.repo': '🔗 GitHub repository: ',
    'footer.repoEnd': '',
    'noscript': 'This tool requires JavaScript.'
  };

  let language = 'ja';
  const STORAGE_KEY = 'caesar-cipher-wheel-language';

  function t(key, values = {}) {
    const dict = language === 'en' ? en : ja;
    const message = dict[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (m, name) => (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : m));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.description'));
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    for (const attr of ['aria-label', 'title', 'placeholder']) {
      root.querySelectorAll(`[data-i18n-${attr}]`).forEach((el) => el.setAttribute(attr, t(el.getAttribute(`data-i18n-${attr}`))));
    }
  }

  function setLanguage(value) {
    if (!['ja', 'en'].includes(value)) return;
    language = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ストレージが使えない環境では記憶しない */ }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ストレージが使えない環境では既定に従う */ }
    const query = new URLSearchParams(location.search).get('lang');
    language = [query, saved].find((v) => v === 'ja' || v === 'en') || (/^ja\b/i.test(navigator.language || '') ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
