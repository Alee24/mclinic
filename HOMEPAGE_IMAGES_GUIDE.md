# Homepage Image Integration Guide

## Generated Images

I've created 3 professional images showing African families being served by M-Clinic medical professionals:

### 1. **hero_home_visit.png**
- **Scene**: African family (mother, father, child) with M-Clinic nurse at home
- **Use**: Main hero section image
- **Location**: Save to `apps/web/public/images/hero-home-visit.png`

### 2. **elderly_care_home.png**
- **Scene**: M-Clinic nurse caring for elderly African woman at home
- **Use**: Services showcase section
- **Location**: Save to `apps/web/public/images/elderly-care.png`

### 3. **doctor_consultation_tablet.png**
- **Scene**: M-Clinic doctor with tablet consulting young African couple
- **Use**: Technology/modern care section
- **Location**: Save to `apps/web/public/images/doctor-consultation.png`

## How to Add Images to Homepage

### Step 1: Save Images

1. Download the 3 generated images from the artifacts
2. Create directory: `apps/web/public/images/`
3. Save images with these names:
   - `hero-home-visit.png`
   - `elderly-care.png`
   - `doctor-consultation.png`

### Step 2: Update Homepage Code

Replace the placeholder divs in `apps/web/src/app/page.tsx`:

#### Hero Section (Line ~140):
```tsx
// REPLACE THIS:
<div className="aspect-[4/3] bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
  <div className="text-center p-8">
    <div className="text-6xl mb-4">👨‍⚕️👨‍👩‍👧</div>
    <p className="text-gray-600 font-medium">
      Replace with: hero_home_visit.png
    </p>
  </div>
</div>

// WITH THIS:
<Image
  src="/images/hero-home-visit.png"
  alt="M-Clinic nurse providing care to African family at home"
  width={800}
  height={600}
  className="w-full h-full object-cover"
  priority
/>
```

#### Elderly Care Image (Line ~240):
```tsx
// REPLACE THIS:
<div className="aspect-[4/3] bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
  ...
</div>

// WITH THIS:
<Image
  src="/images/elderly-care.png"
  alt="M-Clinic nurse caring for elderly patient"
  width={800}
  height={600}
  className="w-full h-full object-cover"
/>
```

#### Doctor Consultation Image (Line ~260):
```tsx
// REPLACE THIS:
<div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
  ...
</div>

// WITH THIS:
<Image
  src="/images/doctor-consultation.png"
  alt="M-Clinic doctor consulting with couple using tablet"
  width={800}
  height={600}
  className="w-full h-full object-cover"
/>
```

### Step 3: Verify Image Import

Make sure the Image component is imported at the top of the file (it already is):
```tsx
import Image from 'next/image';
```

## Alternative: Use External URLs

If you prefer to host images elsewhere (like Cloudinary, AWS S3, etc.):

1. Upload images to your hosting service
2. Get the public URLs
3. Use those URLs in the `src` attribute:
   ```tsx
   <Image
     src="https://your-cdn.com/hero-home-visit.png"
     alt="..."
     width={800}
     height={600}
   />
   ```

## Optimization Tips

### For Best Performance:
1. **Compress images** before uploading (use TinyPNG or similar)
2. **Use WebP format** for better compression
3. **Set appropriate dimensions** (recommended: 1200x900px)
4. **Enable Next.js Image Optimization** (already configured)

### Image Sizes:
- **Hero Image**: 1200x900px (4:3 ratio)
- **Gallery Images**: 800x600px (4:3 ratio)

## Deploy

After adding images:

```bash
cd apps/web
npm run build
pm2 restart mclinic-web
```

## Testing

1. Visit homepage
2. Check that all images load
3. Verify images are responsive on mobile
4. Check loading performance in DevTools

## Troubleshooting

**Images not showing?**
- Check file paths are correct
- Verify images are in `public/images/` folder
- Clear Next.js cache: `rm -rf .next`
- Rebuild: `npm run build`

**Images too large?**
- Compress with TinyPNG
- Convert to WebP format
- Use Next.js Image component (already done)
