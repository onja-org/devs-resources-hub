#!/usr/bin/env node

/**
 * Simple PWA Icon Generator
 * This script creates placeholder PNG icons for the PWA
 * Replace with actual icons for production
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

// Create a simple SVG icon template
const createSVGIcon = (size, text) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563eb"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
        fill="white" text-anchor="middle" dominant-baseline="middle" font-weight="bold">
    O
  </text>
</svg>
`;

// Create SVG files (browsers can use these)
const sizes = [192, 512, 180];
const iconTypes = ['icon', 'icon-maskable', 'apple-touch'];

console.log('🎨 Generating PWA icons...\n');

sizes.forEach(size => {
  const svgContent = createSVGIcon(size, 'O');
  
  // Regular icon
  const iconPath = path.join(publicDir, `icon-${size}.svg`);
  fs.writeFileSync(iconPath, svgContent.trim());
  console.log(`✓ Created icon-${size}.svg`);
  
  // Maskable icon (with padding)
  const maskableContent = createSVGIcon(size, 'O');
  const maskablePath = path.join(publicDir, `icon-${size}-maskable.svg`);
  fs.writeFileSync(maskablePath, maskableContent.trim());
  console.log(`✓ Created icon-${size}-maskable.svg`);
});

// Create apple touch icon
const appleIconPath = path.join(publicDir, 'apple-touch-icon.svg');
fs.writeFileSync(appleIconPath, createSVGIcon(180, 'O').trim());
console.log(`✓ Created apple-touch-icon.svg`);

// Create placeholder screenshot files (you should replace these with real screenshots)
const createPlaceholderScreenshot = (width, height, filename) => {
  const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f3f4f6"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" 
        fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
    ${filename}
  </text>
  <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" 
        fill="#9ca3af" text-anchor="middle" dominant-baseline="middle">
    Replace with actual screenshot
  </text>
</svg>
  `.trim();
  
  const screenshotPath = path.join(publicDir, filename);
  fs.writeFileSync(screenshotPath, svg);
  console.log(`✓ Created placeholder ${filename}`);
};

createPlaceholderScreenshot(1280, 720, 'screenshot-wide.svg');
createPlaceholderScreenshot(750, 1334, 'screenshot-mobile.svg');

console.log('\n✅ PWA icons generated successfully!');
console.log('\n📝 Note: For production, you should:');
console.log('   1. Replace SVG icons with actual PNG icons');
console.log('   2. Take real screenshots of your app');
console.log('   3. Update manifest.json to use .png extensions');
console.log('   4. Consider using a tool like https://realfavicongenerator.net/');
