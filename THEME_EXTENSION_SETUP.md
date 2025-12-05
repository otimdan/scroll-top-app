# Scroll to Top Button - Theme App Extension Setup Guide

## Overview
This Shopify app allows merchants to customize and add a scroll-to-top button to their store using a theme app extension.

## How It Works

### 1. **App Configuration** (`/form`)
- Merchants configure button settings through the admin form page
- Settings include:
  - Button colors (background, hover, icon)
  - Button shape (circle/square)
  - Button position (left/right)
  - Pages where button appears (home, product, collection, all)

### 2. **Database Storage**
- Settings are saved to the `ScrollTopSettings` table in Prisma
- Unique per shop (one-to-one relationship)
- Auto-updated if settings already exist (upsert)

### 3. **API Endpoint** (`/api/settings`)
- Serves the saved settings to the theme
- Returns JSON with all button configuration
- Falls back to defaults if no settings saved

### 4. **Theme App Extension**
- Located in `extensions/scroll-top/`
- Includes two ways to implement the button:
  - **Block** (`blocks/scroll-to-top.liquid`) - Add directly to theme sections
  - **Snippet** (`snippets/scroll-to-top.liquid`) - Include in theme.liquid

## Setup Instructions

### Step 1: Configure Settings in Admin
1. Go to your Shopify app's "Form page"
2. Customize:
   - Colors (background, hover, icon)
   - Shape and position
   - Pages to display on
3. Click "Save" - settings are now stored in database

### Step 2: Add to Theme

#### Option A: Using the Block (Recommended)
1. In Shopify theme editor, add "Scroll to Top Button" block to a section
2. Configure block settings (colors, shape, position, pages)
3. Save theme

#### Option B: Using the Snippet
1. Add to your `theme.liquid` (inside closing `</body>` tag):
   ```liquid
   {% render 'scroll-to-top' %}
   ```
2. This automatically fetches settings from the app API

### Step 3: Deploy
```bash
shopify app deploy
```

## File Structure
```
extensions/scroll-top/
├── blocks/
│   ├── star_rating.liquid      (existing example)
│   └── scroll-to-top.liquid    (new: scroll button block)
├── snippets/
│   ├── stars.liquid             (existing example)
│   └── scroll-to-top.liquid     (new: scroll button snippet)
├── assets/
│   └── thumbs-up.png           (existing)
├── locales/
│   └── en.default.json         (existing)
└── shopify.extension.toml
```

## API Endpoint Response Format

```json
{
  "bgColor": "#28A745",
  "hoverColor": "#1C7530",
  "iconColor": "#FFFFFF",
  "buttonShape": "circle",
  "buttonPosition": "right",
  "showOnHome": false,
  "showOnProduct": false,
  "showOnCollection": false,
  "showOnAll": true
}
```

## Features

✅ Real-time preview in admin form
✅ Color customization (background, hover, icon)
✅ Shape options (circle, square)
✅ Position control (left, right)
✅ Page-specific visibility
✅ Smooth scroll animation
✅ Responsive design
✅ Database persistence

## Troubleshooting

### Button not appearing?
1. Check if settings were saved in admin form
2. Verify theme app extension is deployed
3. Clear browser cache
4. Check console for JavaScript errors

### API not working?
1. Verify `/api/settings` endpoint exists
2. Check shop authentication in loader
3. Ensure database migration ran successfully

### Settings not persisting?
1. Run: `npx prisma migrate dev`
2. Restart dev server
3. Check database connection in `.env`

## Future Enhancements
- [ ] Custom button text/emoji
- [ ] Multiple button styles
- [ ] Scroll trigger distance customization
- [ ] Animation options
- [ ] Mobile-specific settings
