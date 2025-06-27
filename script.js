// Constants
const CONFIG = {
  ALPHABET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  INNER_RADIUS: 120,
  OUTER_RADIUS: 170,
  CENTER_X: 200,
  CENTER_Y: 200,
  LETTER_SIZE: 32
};

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
  themeToggle: null,
  themeIcon: null
};

// State
const state = {
  showLines: false,
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
  elements.themeToggle = document.getElementById('themeToggle');
  elements.themeIcon = elements.themeToggle.querySelector('.theme-icon');
}

// Cipher functionality
function caesarCipher(text, shift, decrypt = false) {
  return text.toUpperCase().replace(/[A-Z]/g, c => {
    const index = state.alphabet.indexOf(c);
    if (index === -1) return c;
    const offset = decrypt ? (index - shift + 26) % 26 : (index + shift) % 26;
    return state.alphabet[offset];
  });
}

// Ring creation
function createRing(container, isInner = false) {
  container.innerHTML = '';
  const radius = isInner ? CONFIG.INNER_RADIUS : CONFIG.OUTER_RADIUS;
  
  state.alphabet.forEach((char, i) => {
    const angle = (360 / state.alphabet.length) * i;
    const angleRad = (angle - 90) * Math.PI / 180;
    const x = CONFIG.CENTER_X + radius * Math.cos(angleRad);
    const y = CONFIG.CENTER_Y + radius * Math.sin(angleRad);
    
    const el = document.createElement('div');
    el.className = `letter ${isInner ? 'inner-letter' : 'outer-letter'}`;
    el.style.left = `${x - CONFIG.LETTER_SIZE / 2}px`;
    el.style.top = `${y - CONFIG.LETTER_SIZE / 2}px`;
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
  
  const shift = parseInt(elements.shiftSlider.value);
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const isDecrypt = mode === 'decrypt';
  const ringRotationAngle = (360 / 26) * shift * (isDecrypt ? 1 : -1);
  
  state.alphabet.forEach((char, i) => {
    const outerAngle = (360 / 26) * i - 90;
    const outerX = CONFIG.CENTER_X + CONFIG.OUTER_RADIUS * Math.cos(outerAngle * Math.PI / 180);
    const outerY = CONFIG.CENTER_Y + CONFIG.OUTER_RADIUS * Math.sin(outerAngle * Math.PI / 180);
    
    const targetIndex = isDecrypt ? (i - shift + 26) % 26 : (i + shift) % 26;
    const innerAngle = (360 / 26) * targetIndex - 90 + ringRotationAngle;
    const innerX = CONFIG.CENTER_X + CONFIG.INNER_RADIUS * Math.cos(innerAngle * Math.PI / 180);
    const innerY = CONFIG.CENTER_Y + CONFIG.INNER_RADIUS * Math.sin(innerAngle * Math.PI / 180);
    
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
  elements.themeToggle.addEventListener('click', () => themeManager.toggleTheme());
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