// Constants
const CONFIG = {
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  INNER_RADIUS: 120,
  OUTER_RADIUS: 170,
  CENTER_X: 200,
  CENTER_Y: 200,
  LETTER_SIZE: 32
};

// Dynamic configuration based on container size
function getResponsiveConfig() {
  const container = elements.outerRing?.parentElement;
  if (!container) return CONFIG;
  
  const containerWidth = container.offsetWidth;
  
  // Different configurations for various screen sizes
  let innerRadius, outerRadius, letterSize;
  
  if (containerWidth <= 280) {
    // Very small screens (280px)
    innerRadius = 84;
    outerRadius = 119;
    letterSize = 22;
  } else if (containerWidth <= 300) {
    // Small screens (300px)
    innerRadius = 90;
    outerRadius = 127;
    letterSize = 24;
  } else if (containerWidth <= 320) {
    // Medium-small screens (320px)
    innerRadius = 96;
    outerRadius = 136;
    letterSize = 24;
  } else {
    // Default (400px)
    innerRadius = 120;
    outerRadius = 170;
    letterSize = 32;
  }
  
  return {
    ALPHABET: CONFIG.ALPHABET,
    INNER_RADIUS: innerRadius,
    OUTER_RADIUS: outerRadius,
    CENTER_X: containerWidth / 2,
    CENTER_Y: containerWidth / 2,
    LETTER_SIZE: letterSize
  };
}

// DOM Elements
const elements = {
  outerRing: null,
  innerRing: null,
  inputText: null,
  shiftSlider: null,
  shiftNumber: null,
  output: null,
  correspondenceLines: null,
  toggleSwitch: null,
  excludeToggle: null,
  themeToggle: null,
  themeIcon: null,
  copyButton: null
};

// State
const state = {
  showLines: false,
  excludeNonAlpha: false,
  alphabet: [...CONFIG.ALPHABET]
};

// Initialize DOM elements
function initializeElements() {
  elements.outerRing = document.getElementById('outerRing');
  elements.innerRing = document.getElementById('innerRing');
  elements.inputText = document.getElementById('inputText');
  elements.shiftSlider = document.getElementById('shift');
  elements.shiftNumber = document.getElementById('shiftNumber');
  elements.output = document.getElementById('output');
  elements.correspondenceLines = document.getElementById('correspondenceLines');
  elements.toggleSwitch = document.getElementById('toggleSwitch');
  elements.excludeToggle = document.getElementById('excludeToggle');
  elements.themeToggle = document.getElementById('themeToggle');
  elements.themeIcon = elements.themeToggle.querySelector('.theme-icon');
  elements.copyButton = document.getElementById('copyButton');
}

// Cipher functionality
function caesarCipher(text, shift, decrypt = false) {
  const upperText = text.toUpperCase();
  
  if (state.excludeNonAlpha) {
    // Remove all non-alphabetic characters first, then encrypt/decrypt
    const alphabeticOnly = upperText.replace(/[^A-Z]/g, '');
    return alphabeticOnly.replace(/[A-Z]/g, c => {
      const index = state.alphabet.indexOf(c);
      if (index === -1) return c;
      const offset = decrypt ? (index - shift + 26) % 26 : (index + shift) % 26;
      return state.alphabet[offset];
    });
  } else {
    // Keep spaces and symbols, only encrypt/decrypt letters
    return upperText.replace(/[A-Z]/g, c => {
      const index = state.alphabet.indexOf(c);
      if (index === -1) return c;
      const offset = decrypt ? (index - shift + 26) % 26 : (index + shift) % 26;
      return state.alphabet[offset];
    });
  }
}

// Ring creation
function createRing(container, isInner = false) {
  container.innerHTML = '';
  const config = getResponsiveConfig();
  const radius = isInner ? config.INNER_RADIUS : config.OUTER_RADIUS;
  
  state.alphabet.forEach((char, i) => {
    const angle = (360 / state.alphabet.length) * i;
    const angleRad = (angle - 90) * Math.PI / 180;
    const x = config.CENTER_X + radius * Math.cos(angleRad);
    const y = config.CENTER_Y + radius * Math.sin(angleRad);
    
    const el = document.createElement('div');
    el.className = `letter ${isInner ? 'inner-letter' : 'outer-letter'}`;
    el.style.left = `${x - config.LETTER_SIZE / 2}px`;
    el.style.top = `${y - config.LETTER_SIZE / 2}px`;
    el.style.fontSize = `${config.LETTER_SIZE * 0.56}px`; // Dynamic font size
    el.style.width = `${config.LETTER_SIZE}px`;
    el.style.height = `${config.LETTER_SIZE}px`;
    el.style.lineHeight = `${config.LETTER_SIZE}px`;
    el.innerText = char;
    
    if (isInner) {
      el.setAttribute('data-letter', char);
    }
    
    container.appendChild(el);
  });
}

// Correspondence lines
function drawCorrespondenceLines() {
  elements.correspondenceLines.innerHTML = '';
  if (!state.showLines) return;
  
  const config = getResponsiveConfig();
  const container = elements.outerRing?.parentElement;
  if (!container) return;
  
  // Set SVG viewBox to match the actual container size
  const containerSize = container.offsetWidth;
  elements.correspondenceLines.setAttribute('viewBox', `0 0 ${containerSize} ${containerSize}`);
  
  const shift = parseInt(elements.shiftSlider.value);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const isDecrypt = mode === 'decrypt';
  const ringRotationAngle = (360 / 26) * shift * (isDecrypt ? 1 : -1);
  
  state.alphabet.forEach((char, i) => {
    const outerAngle = (360 / 26) * i - 90;
    const outerX = config.CENTER_X + config.OUTER_RADIUS * Math.cos(outerAngle * Math.PI / 180);
    const outerY = config.CENTER_Y + config.OUTER_RADIUS * Math.sin(outerAngle * Math.PI / 180);
    
    const targetIndex = isDecrypt ? (i - shift + 26) % 26 : (i + shift) % 26;
    const innerAngle = (360 / 26) * targetIndex - 90 + ringRotationAngle;
    const innerX = config.CENTER_X + config.INNER_RADIUS * Math.cos(innerAngle * Math.PI / 180);
    const innerY = config.CENTER_Y + config.INNER_RADIUS * Math.sin(innerAngle * Math.PI / 180);
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', outerX);
    line.setAttribute('y1', outerY);
    line.setAttribute('x2', innerX);
    line.setAttribute('y2', innerY);
    line.setAttribute('stroke', '#e74c3c');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('opacity', '0.7');
    
    elements.correspondenceLines.appendChild(line);
  });
}

function toggleLines() {
  state.showLines = !state.showLines;
  elements.toggleSwitch.classList.toggle('active', state.showLines);
  elements.correspondenceLines.classList.toggle('hidden', !state.showLines);
  drawCorrespondenceLines();
}

function toggleExcludeNonAlpha() {
  state.excludeNonAlpha = !state.excludeNonAlpha;
  elements.excludeToggle.classList.toggle('active', state.excludeNonAlpha);
  update();
}

// Main update function
function update() {
  const shift = parseInt(elements.shiftSlider.value);
  elements.shiftNumber.value = shift;
  
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const isDecrypt = mode === 'decrypt';
  const angle = (360 / 26) * shift * (isDecrypt ? 1 : -1);
  
  elements.innerRing.style.transform = `rotate(${angle}deg)`;
  
  const innerLetters = elements.innerRing.querySelectorAll('.inner-letter');
  innerLetters.forEach(letter => {
    letter.style.transform = `rotate(${-angle}deg)`;
  });
  
  const text = elements.inputText.value;
  if (text) {
    const result = caesarCipher(text, shift, isDecrypt);
    elements.output.textContent = result;
  } else {
    elements.output.textContent = 'Enter text above to see the result';
  }
  
  drawCorrespondenceLines();
}

// Copy functionality
async function copyToClipboard() {
  const outputText = elements.output.textContent;
  
  if (!outputText || outputText === 'Enter text above to see the result') {
    return;
  }
  
  try {
    await navigator.clipboard.writeText(outputText);
    
    // Visual feedback
    const originalIcon = elements.copyButton.querySelector('.copy-icon').textContent;
    elements.copyButton.querySelector('.copy-icon').textContent = '✓';
    elements.copyButton.classList.add('success');
    
    setTimeout(() => {
      elements.copyButton.querySelector('.copy-icon').textContent = originalIcon;
      elements.copyButton.classList.remove('success');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy text:', err);
    
    // Fallback for older browsers
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = outputText;
    tempTextArea.style.position = 'fixed';
    tempTextArea.style.left = '-9999px';
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    
    try {
      document.execCommand('copy');
      // Visual feedback for fallback
      const originalIcon = elements.copyButton.querySelector('.copy-icon').textContent;
      elements.copyButton.querySelector('.copy-icon').textContent = '✓';
      elements.copyButton.classList.add('success');
      
      setTimeout(() => {
        elements.copyButton.querySelector('.copy-icon').textContent = originalIcon;
        elements.copyButton.classList.remove('success');
      }, 2000);
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
    }
    
    document.body.removeChild(tempTextArea);
  }
}

// Theme management
const themeManager = {
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    elements.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', theme);
  },
  
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },
  
  initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (prefersDark) {
      this.setTheme('dark');
    } else {
      this.setTheme('light');
    }
    
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
};

// Event handlers
function setupEventListeners() {
  elements.shiftSlider.addEventListener('input', () => {
    elements.shiftNumber.value = elements.shiftSlider.value;
    update();
  });
  
  elements.shiftNumber.addEventListener('input', () => {
    const value = Math.min(25, Math.max(0, parseInt(elements.shiftNumber.value) || 0));
    elements.shiftNumber.value = value;
    elements.shiftSlider.value = value;
    update();
  });
  
  elements.inputText.addEventListener('input', update);
  
  document.querySelectorAll('input[name="mode"]').forEach(r => 
    r.addEventListener('change', update)
  );
  
  elements.toggleSwitch.addEventListener('click', toggleLines);
  elements.excludeToggle.addEventListener('click', toggleExcludeNonAlpha);
  elements.themeToggle.addEventListener('click', () => themeManager.toggleTheme());
  elements.copyButton.addEventListener('click', copyToClipboard);
  
  // Window resize handler with debouncing
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      createRing(elements.outerRing);
      createRing(elements.innerRing, true);
      update();
    }, 250);
  });
  
  // Orientation change handler for mobile devices
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      createRing(elements.outerRing);
      createRing(elements.innerRing, true);
      update();
    }, 300);
  });
}

// Initialize application
function initialize() {
  initializeElements();
  createRing(elements.outerRing);
  createRing(elements.innerRing, true);
  themeManager.initializeTheme();
  setupEventListeners();
  update();
}

// Start the application when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);