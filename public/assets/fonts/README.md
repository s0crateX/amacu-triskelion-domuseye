# Poppins Font Family

## Implementation Details

### 1. Font Files
This directory contains the Poppins font family files:

- Poppins-Thin.ttf
- Poppins-ThinItalic.ttf
- Poppins-ExtraLight.ttf
- Poppins-ExtraLightItalic.ttf
- Poppins-Light.ttf
- Poppins-LightItalic.ttf
- Poppins-Regular.ttf
- Poppins-Italic.ttf
- Poppins-Medium.ttf
- Poppins-MediumItalic.ttf
- Poppins-SemiBold.ttf
- Poppins-SemiBoldItalic.ttf
- Poppins-Bold.ttf
- Poppins-BoldItalic.ttf
- Poppins-ExtraBold.ttf
- Poppins-ExtraBoldItalic.ttf
- Poppins-Black.ttf
- Poppins-BlackItalic.ttf

### 2. CSS Implementation
The fonts are implemented in the global CSS file (`src/app/globals.css`) using @font-face declarations:

```css
@font-face {
  font-family: 'Poppins';
  src: url('/fonts/Poppins-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Additional @font-face declarations for other weights and variants */
```

### 3. Tailwind CSS Configuration
The fonts are configured in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'var(--font-geist-sans)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
};
```

### 4. Utility Functions
Utility functions for using the fonts are available in `src/utils/fonts.ts`:

```ts
export const poppinsFonts = {
  regular: 'font-poppins font-normal',
  bold: 'font-poppins font-bold',
  // Additional weight and italic variants...
};

export const withFont = (fontClass, otherClasses = '') => {
  return `${fontClass} ${otherClasses}`.trim();
};
```

### 5. Example Usage
To see examples of all font variants, visit the `/font-examples` page in the application.

### 6. Best Practices
- For headings and important text, use Poppins Bold, Extra Bold, or Black weights
- For body text, use Poppins Regular or Light weights
- Use italic variants for emphasis where appropriate
- Consider using different weights to create visual hierarchy
- Ensure sufficient contrast between text and background for readability