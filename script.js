const CONFIG = {
  INNER_RADIUS: 120,
  OUTER_RADIUS: 170,
  LETTER_SIZE: 32
};

const elements = {
  outerRing: null,
  innerRing: null,
  inputText: null,
  shiftSlider: null,
  shiftNumber: null,
  output: null,
  correspondenceLines: null,
  showLines: null,
  excludeNonAlpha: null,
  themeToggle: null,
  themeIcon: null,
  copyButton: null,
  copyIcon: null,
  copyFeedback: null,
  diskDescription: null
};

const state = {
  showLines: false,
  excludeNonAlpha: false
};

function getResponsiveConfig() {
  const container = elements.outerRing?.parentElement;
  if (!container) {
    return CONFIG;
  }

  const containerWidth = container.offsetWidth;
  let innerRadius;
  let outerRadius;
  let letterSize;

  if (containerWidth <= 280) {
    innerRadius = 84;
    outerRadius = 119;
    letterSize = 22;
  } else if (containerWidth <= 300) {
    innerRadius = 90;
    outerRadius = 127;
    letterSize = 24;
  } else if (containerWidth <= 320) {
    innerRadius = 96;
    outerRadius = 136;
    letterSize = 24;
  } else {
    innerRadius = CONFIG.INNER_RADIUS;
    outerRadius = CONFIG.OUTER_RADIUS;
    letterSize = CONFIG.LETTER_SIZE;
  }

  return {
    INNER_RADIUS: innerRadius,
    OUTER_RADIUS: outerRadius,
    CENTER_X: containerWidth / 2,
    CENTER_Y: containerWidth / 2,
    LETTER_SIZE: letterSize
  };
}

function initializeElements() {
  elements.outerRing = document.getElementById('outerRing');
  elements.innerRing = document.getElementById('innerRing');
  elements.inputText = document.getElementById('inputText');
  elements.shiftSlider = document.getElementById('shift');
  elements.shiftNumber = document.getElementById('shiftNumber');
  elements.output = document.getElementById('output');
  elements.correspondenceLines = document.getElementById('correspondenceLines');
  elements.showLines = document.getElementById('showLines');
  elements.excludeNonAlpha = document.getElementById('excludeNonAlpha');
  elements.themeToggle = document.getElementById('themeToggle');
  elements.themeIcon = elements.themeToggle.querySelector('.theme-icon');
  elements.copyButton = document.getElementById('copyButton');
  elements.copyIcon = elements.copyButton.querySelector('.copy-icon');
  elements.copyFeedback = document.getElementById('copyFeedback');
  elements.diskDescription = document.getElementById('diskDescription');
}

function createRing(container, isInner = false) {
  container.replaceChildren();
  const config = getResponsiveConfig();
  const radius = isInner ? config.INNER_RADIUS : config.OUTER_RADIUS;

  [...CaesarCipher.ALPHABET].forEach((character, index) => {
    const angle = (360 / CaesarCipher.ALPHABET.length) * index;
    const angleRadians = (angle - 90) * Math.PI / 180;
    const x = config.CENTER_X + radius * Math.cos(angleRadians);
    const y = config.CENTER_Y + radius * Math.sin(angleRadians);
    const letter = document.createElement('div');

    letter.className = `letter ${isInner ? 'inner-letter' : 'outer-letter'}`;
    letter.style.left = `${x - config.LETTER_SIZE / 2}px`;
    letter.style.top = `${y - config.LETTER_SIZE / 2}px`;
    letter.style.fontSize = `${config.LETTER_SIZE * 0.56}px`;
    letter.style.width = `${config.LETTER_SIZE}px`;
    letter.style.height = `${config.LETTER_SIZE}px`;
    letter.style.lineHeight = `${config.LETTER_SIZE}px`;
    letter.textContent = character;

    if (isInner) {
      letter.setAttribute('data-letter', character);
    }

    container.appendChild(letter);
  });
}

function drawCorrespondenceLines() {
  elements.correspondenceLines.replaceChildren();
  if (!state.showLines) {
    return;
  }

  const config = getResponsiveConfig();
  const container = elements.outerRing?.parentElement;
  if (!container) {
    return;
  }

  const containerSize = container.offsetWidth;
  elements.correspondenceLines.setAttribute('viewBox', `0 0 ${containerSize} ${containerSize}`);

  const shift = CaesarCipher.normalizeShift(parseInt(elements.shiftSlider.value, 10));
  const isDecrypt = document.querySelector('input[name="mode"]:checked').value === 'decrypt';
  const ringRotationAngle = (360 / CaesarCipher.ALPHABET.length) * shift * (isDecrypt ? 1 : -1);

  [...CaesarCipher.ALPHABET].forEach((character, index) => {
    const outerAngle = (360 / CaesarCipher.ALPHABET.length) * index - 90;
    const outerX = config.CENTER_X + config.OUTER_RADIUS * Math.cos(outerAngle * Math.PI / 180);
    const outerY = config.CENTER_Y + config.OUTER_RADIUS * Math.sin(outerAngle * Math.PI / 180);
    const targetIndex = (index + (isDecrypt ? -shift : shift) + CaesarCipher.ALPHABET.length) % CaesarCipher.ALPHABET.length;
    const innerAngle = (360 / CaesarCipher.ALPHABET.length) * targetIndex - 90 + ringRotationAngle;
    const innerX = config.CENTER_X + config.INNER_RADIUS * Math.cos(innerAngle * Math.PI / 180);
    const innerY = config.CENTER_Y + config.INNER_RADIUS * Math.sin(innerAngle * Math.PI / 180);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    line.setAttribute('x1', outerX);
    line.setAttribute('y1', outerY);
    line.setAttribute('x2', innerX);
    line.setAttribute('y2', innerY);
    elements.correspondenceLines.appendChild(line);
  });
}

function updateCorrespondenceLines() {
  elements.correspondenceLines.classList.toggle('hidden', !state.showLines);
  drawCorrespondenceLines();
}

function updateDiskDescription(shift, isDecrypt) {
  const mappedLetter = CaesarCipher.caesarShift('A', shift, { decrypt: isDecrypt });
  const mode = isDecrypt ? 'decrypt' : 'encrypt';
  elements.diskDescription.textContent = `Shift ${shift}, ${mode} mode: A maps to ${mappedLetter}`;
}

function update() {
  const shift = CaesarCipher.normalizeShift(parseInt(elements.shiftSlider.value, 10));
  elements.shiftSlider.value = shift;
  elements.shiftNumber.value = shift;

  const isDecrypt = document.querySelector('input[name="mode"]:checked').value === 'decrypt';
  const angle = (360 / CaesarCipher.ALPHABET.length) * shift * (isDecrypt ? 1 : -1);
  elements.innerRing.style.transform = `rotate(${angle}deg)`;

  elements.innerRing.querySelectorAll('.inner-letter').forEach(letter => {
    letter.style.transform = `rotate(${-angle}deg)`;
  });

  if (elements.inputText.value) {
    elements.output.textContent = CaesarCipher.caesarShift(elements.inputText.value, shift, {
      decrypt: isDecrypt,
      excludeNonAlpha: state.excludeNonAlpha
    });
  } else {
    elements.output.textContent = 'Enter text above to see the result';
  }

  updateDiskDescription(shift, isDecrypt);
  updateCorrespondenceLines();
}

function clampShift(value) {
  const parsedValue = parseInt(value, 10);
  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.min(25, Math.max(0, parsedValue));
}

function showCopyFeedback(message, isSuccess) {
  elements.copyIcon.textContent = isSuccess ? '✓' : '!';
  elements.copyButton.classList.toggle('success', isSuccess);
  elements.copyButton.classList.toggle('failure', !isSuccess);
  elements.copyFeedback.textContent = message;

  window.setTimeout(() => {
    elements.copyIcon.textContent = '📋';
    elements.copyButton.classList.remove('success', 'failure');
    elements.copyFeedback.textContent = '';
  }, 2000);
}

async function copyToClipboard() {
  const outputText = elements.output.textContent;
  if (!outputText || outputText === 'Enter text above to see the result') {
    return;
  }

  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Clipboard API is unavailable');
    }

    await navigator.clipboard.writeText(outputText);
    showCopyFeedback('Copied', true);
  } catch {
    showCopyFeedback('Copy failed', false);
  }
}

function getSavedTheme() {
  try {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
  } catch {
    return null;
  }
}

function getEffectiveTheme() {
  const explicitTheme = document.documentElement.getAttribute('data-theme');
  if (explicitTheme === 'light' || explicitTheme === 'dark') {
    return explicitTheme;
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeButton(theme) {
  const isDark = theme === 'dark';
  elements.themeIcon.textContent = isDark ? '☀️' : '🌙';
  elements.themeToggle.setAttribute('aria-pressed', String(isDark));
  elements.themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

const themeManager = {
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // The control remains usable when storage is unavailable.
    }
    updateThemeButton(theme);
  },

  toggleTheme() {
    this.setTheme(getEffectiveTheme() === 'dark' ? 'light' : 'dark');
  },

  initializeTheme() {
    const savedTheme = getSavedTheme();
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
    updateThemeButton(getEffectiveTheme());

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (!getSavedTheme()) {
          updateThemeButton(getEffectiveTheme());
        }
      });
    }
  }
};

function setupEventListeners() {
  elements.shiftSlider.addEventListener('input', () => {
    elements.shiftNumber.value = elements.shiftSlider.value;
    update();
  });

  const commitNumberShift = () => {
    const shift = clampShift(elements.shiftNumber.value);
    elements.shiftNumber.value = shift;
    elements.shiftSlider.value = shift;
    update();
  };

  elements.shiftNumber.addEventListener('change', commitNumberShift);
  elements.shiftNumber.addEventListener('blur', commitNumberShift);
  elements.inputText.addEventListener('input', update);

  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', update);
  });

  elements.showLines.addEventListener('change', () => {
    state.showLines = elements.showLines.checked;
    updateCorrespondenceLines();
  });

  elements.excludeNonAlpha.addEventListener('change', () => {
    state.excludeNonAlpha = elements.excludeNonAlpha.checked;
    update();
  });

  elements.themeToggle.addEventListener('click', () => themeManager.toggleTheme());
  elements.copyButton.addEventListener('click', copyToClipboard);

  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      createRing(elements.outerRing);
      createRing(elements.innerRing, true);
      update();
    }, 250);
  });

  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => {
      createRing(elements.outerRing);
      createRing(elements.innerRing, true);
      update();
    }, 300);
  });
}

function initialize() {
  initializeElements();
  createRing(elements.outerRing);
  createRing(elements.innerRing, true);
  themeManager.initializeTheme();
  setupEventListeners();
  update();
}

document.addEventListener('DOMContentLoaded', initialize);
