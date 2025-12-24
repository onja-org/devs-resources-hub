# Creating the OG Image

## Quick Start

The current og-image.svg is a placeholder. For production, create a proper PNG image:

### Option 1: Use Online Tools (Easiest)
1. Go to [Canva](https://www.canva.com/) or [Figma](https://www.figma.com/)
2. Create a new design with dimensions: **1200 x 630 pixels**
3. Design with:
   - Background gradient (blue #2563eb to purple #7c3aed)
   - "Dev Resources Hub" as main title (72px, bold, white)
   - "265+ Free Programming Tutorials & Courses" (36px, white)
   - Technology icons or keywords
   - Onja branding/logo
   - "Learn. Grow. Achieve." tagline
4. Export as PNG
5. Save to `/public/og-image.png`

### Option 2: Convert SVG to PNG
```bash
# Using ImageMagick (if installed)
convert -background none -size 1200x630 public/og-image.svg public/og-image.png

# Using online converter
# Visit: https://cloudconvert.com/svg-to-png
# Upload og-image.svg, convert, download
```

### Option 3: Use Vercel OG Image Generation
```typescript
// Create app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(to right, #2563eb, #7c3aed)',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}>
        <h1 style={{ fontSize: 72, fontWeight: 'bold' }}>Dev Resources Hub</h1>
        <p style={{ fontSize: 36 }}>265+ Free Programming Tutorials & Courses</p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

## Testing Your OG Image

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **OpenGraph.xyz**: https://www.opengraph.xyz/

## Best Practices

- ✅ Dimensions: Exactly 1200 x 630 pixels
- ✅ Format: PNG or JPG (PNG recommended)
- ✅ File size: Under 1MB (ideally under 300KB)
- ✅ Text: Large enough to read when thumbnail-sized
- ✅ Contrast: High contrast for readability
- ✅ Branding: Include logo/brand colors
- ✅ Safe zone: Keep important content 10% from edges

## Current Status

- ⚠️ Using SVG placeholder (may not display on all platforms)
- 🎯 Todo: Create og-image.png for production
- 📋 Metadata already configured in layout.tsx
