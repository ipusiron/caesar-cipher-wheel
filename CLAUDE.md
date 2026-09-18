# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive Caesar cipher educational tool built with vanilla HTML, CSS, and JavaScript. Features a visual spinning cipher disk interface demonstrating encryption/decryption with a dual-ring system.

## Architecture

**File Structure:**
- `index.html` - HTML structure only
- `cipher.js` - DOM-independent Caesar cipher functions exposed to browsers and CommonJS tests
- `script.js` - Ring creation, event handling, accessibility updates, and theme management
- `style.css` - All CSS styles including responsive design and dark mode
- `assets/` - README screenshots
- `test/` - Node.js built-in test files for the cipher, README, and static HTML
- `package.json` - Dependency-free `npm test` command
- `.github/workflows/test.yml` - Node.js 22 test workflow for push and pull requests
- `README.md` - Documentation in Japanese

**Key JavaScript Components:**
- `CONFIG` object - Ring radii and dimensions for the visual interface
- `getResponsiveConfig()` - Dynamic sizing based on container width
- `CaesarCipher.normalizeShift()` - Normalizes a shift to an integer from 0 through 25
- `CaesarCipher.caesarShift()` - Core encryption/decryption algorithm in `cipher.js`
- `createRing(container, isInner)` - Generates letter elements positioned in a circle
- `themeManager` - Handles theme selection with safe localStorage access

**Visual Features:**
- Outer ring (fixed, plaintext) and inner ring (rotates, ciphertext)
- Inner ring rotates while letters maintain upright orientation via counter-rotation
- Optional correspondence lines (SVG) showing letter mappings
- Exclude spaces/symbols checkbox

## Development

**No Build Process:** Open `index.html` directly in any browser.

**Testing:** Run `npm test` with Node.js 22 or later. The repository has no npm dependencies; the tests use `node --test`.

## Customization

- **Colors:** CSS custom properties in `:root`, `[data-theme="dark"]`, and the dark OS-preference selector
- **Disk Size:** `.disk-container` dimensions (currently 400px, with breakpoints at 480px, 375px, 320px)
- **Ring Radii:** `CONFIG` object in `script.js` and `getResponsiveConfig()` function
