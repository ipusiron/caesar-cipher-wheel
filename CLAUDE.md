# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file interactive Caesar cipher educational tool built with vanilla HTML, CSS, and JavaScript. The tool features a visual spinning cipher disk interface that demonstrates the encryption/decryption process with a dual-ring system.

## Architecture

**Single File Structure:**
- `index.html` - Complete application containing HTML structure, CSS styles, and JavaScript logic
- `README.md` - Comprehensive documentation in Japanese
- `LICENSE` - MIT license file

**Key Components:**
- Visual cipher disk with outer ring (plaintext, gray) and inner ring (ciphertext, beige)
- Real-time encryption/decryption with text input
- Shift value controls (0-25) via slider and number input
- Mode toggle between encrypt/decrypt operations

## Development

**No Build Process:** This is a static HTML file that can be opened directly in any modern browser.

**Testing:** Open `index.html` in a browser to test functionality.

**Core Algorithm:**
```javascript
function caesarCipher(text, shift, decrypt = false) {
  return text.toUpperCase().replace(/[A-Z]/g, c => {
    const index = alphabet.indexOf(c);
    if (index === -1) return c;
    const offset = decrypt ? (index - shift + 26) % 26 : (index + shift) % 26;
    return alphabet[offset];
  });
}
```

**Key Visual Feature:** Inner ring rotates while letters maintain upright orientation using counter-rotation transforms.

## Technical Details

- **Responsive Design:** Adapts to mobile devices (320px breakpoint)
- **Smooth Animations:** CSS transitions with cubic-bezier easing
- **Accessibility:** High contrast colors and keyboard navigation
- **Browser Support:** All modern browsers including mobile

## Customization Areas

- **Colors:** Modify `.outer-ring-bg` and `.inner-ring-bg` CSS classes
- **Disk Size:** Adjust `.disk-container` dimensions
- **Animation Timing:** Update transition duration in CSS