# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Caesar cipher educational tool built with vanilla HTML, CSS, and JavaScript. Features a visual spinning cipher disk interface demonstrating encryption/decryption with a dual-ring system.

## Architecture

**File Structure:**
- `index.html` - HTML structure only
- `script.js` - All JavaScript logic (cipher algorithm, ring creation, event handling, theme management)
- `style.css` - All CSS styles including responsive design and dark mode
- `README.md` - Documentation in Japanese

**Key JavaScript Components (`script.js`):**
- `CONFIG` object - Constants for alphabet, radii, and dimensions
- `getResponsiveConfig()` - Dynamic sizing based on container width
- `caesarCipher(text, shift, decrypt)` - Core encryption/decryption algorithm
- `createRing(container, isInner)` - Generates letter elements positioned in a circle
- `themeManager` - Handles dark/light mode with localStorage persistence

**Visual Features:**
- Outer ring (fixed, plaintext) and inner ring (rotates, ciphertext)
- Inner ring rotates while letters maintain upright orientation via counter-rotation
- Optional correspondence lines (SVG) showing letter mappings
- Exclude spaces/symbols toggle

## Development

**No Build Process:** Open `index.html` directly in any browser.

**Testing:** Manual browser testing. No automated tests.

## Customization

- **Colors:** CSS custom properties in `:root` and `[data-theme="dark"]` selectors
- **Disk Size:** `.disk-container` dimensions (currently 400px, with breakpoints at 480px, 375px, 320px)
- **Ring Radii:** `CONFIG` object in `script.js` and `getResponsiveConfig()` function