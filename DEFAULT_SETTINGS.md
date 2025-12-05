# Default Settings Configuration

## Overview

The Scroll to Top Button extension now automatically creates default settings when:

1. ✅ The app is first installed
2. ✅ The user visits the app admin for the first time
3. ✅ The user visits the Form page

This ensures the button **displays immediately without requiring manual setup**.

## Default Settings

When the app initializes, these default values are created:

```json
{
  "bgColor": "#28A745", // Green background
  "hoverColor": "#1C7530", // Darker green on hover
  "iconColor": "#FFFFFF", // White up arrow
  "buttonShape": "circle", // Circular button
  "buttonPosition": "right", // Right side of screen
  "showOnHome": false,
  "showOnProduct": false,
  "showOnCollection": false,
  "showOnAll": true // Show on all pages
}
```

## How It Works

### 1. **App Install Webhook** (`webhooks.app.installed.jsx`)

- Triggers when app is first installed
- Creates metafield with default settings
- Button immediately visible in store

### 2. **Admin Homepage** (`app._index.jsx`)

- Loader checks for existing metafield
- Creates defaults if none exist
- Fallback if webhook fails

### 3. **Form Page** (`app.form.jsx`)

- Another check point to ensure settings exist
- Creates defaults if needed
- Merchant can then customize

### 4. **Theme Block** (`blocks/scroll-to-top.liquid`)

- Reads from metafield (with defaults hardcoded as fallback)
- If metafield missing, uses inline defaults
- Button always visible with some styling

## Flow Diagram

```
App Installed
    ↓
webhooks.app.installed.jsx
    ↓
Create default metafield
    ↓
Button appears in store

─────────────────────────────

OR

User opens app admin
    ↓
app._index.jsx loader
    ↓
Check metafield exists?
    ├─ Yes → continue
    └─ No → create defaults
    ↓
Button appears in store

─────────────────────────────

OR

User visits Form page
    ↓
app.form.jsx loader
    ↓
Check metafield exists?
    ├─ Yes → load form
    └─ No → create defaults
    ↓
Button appears in store
```

## What User Sees

### Before Customization

- ✅ Green button (default color)
- ✅ Circle shape
- ✅ Bottom right corner
- ✅ Appears when scroll > 300px
- ✅ Works on all pages

### After Customization

- User opens Form page
- Adjusts colors, shape, position, pages
- Clicks Save
- Settings update immediately in theme

## Key Files Involved

| File                            | Role                                      |
| ------------------------------- | ----------------------------------------- |
| `webhooks.app.installed.jsx`    | Creates defaults on app install           |
| `app._index.jsx`                | Checks/creates defaults on first visit    |
| `app.form.jsx`                  | Checks/creates defaults before form loads |
| `blocks/scroll-to-top.liquid`   | Uses metafield or inline defaults         |
| `snippets/scroll-to-top.liquid` | Uses metafield or inline defaults         |

## Default Settings in Code

Each file has these defaults as fallback:

**JavaScript:**

```javascript
const defaultSettings = {
  bgColor: "#28A745",
  hoverColor: "#1C7530",
  iconColor: "#FFFFFF",
  buttonShape: "circle",
  buttonPosition: "right",
  showOnHome: false,
  showOnProduct: false,
  showOnCollection: false,
  showOnAll: true,
};
```

**Liquid:**

```liquid
{% assign default_json = '{"bgColor":"#28A745","hoverColor":"#1C7530","iconColor":"#FFFFFF","buttonShape":"circle","buttonPosition":"right","showOnHome":false,"showOnProduct":false,"showOnCollection":false,"showOnAll":true}' %}
```

## Metafield Location

```
Shop Resource
└── Metafield
    ├── Namespace: "scroll_top_app"
    ├── Key: "settings"
    ├── Type: "json"
    └── Value: {...default settings...}
```

## Testing Default Settings

### 1. Fresh Install

```bash
# Delete app and reinstall
shopify app delete
shopify app deploy
```

### 2. Check Metafield Created

In GraphQL Admin:

```graphql
{
  shop {
    metafield(namespace: "scroll_top_app", key: "settings") {
      value
    }
  }
}
```

### 3. Verify Button Appears

1. Visit store
2. Scroll down 300px
3. Green button appears (bottom right)
4. Click → smooth scroll to top

## Customizing Defaults

To change the default settings:

1. **In `webhooks.app.installed.jsx`:**

   ```javascript
   const defaultSettings = {
     bgColor: "#YOUR_COLOR",
     // ... other settings
   };
   ```

2. **In `app._index.jsx`:**

   ```javascript
   const defaultSettings = {
     bgColor: "#YOUR_COLOR",
     // ... other settings
   };
   ```

3. **In `app.form.jsx`:**

   ```javascript
   const defaultSettings = {
     bgColor: "#YOUR_COLOR",
     // ... other settings
   };
   ```

4. **In theme liquid:**

   ```liquid
   {% assign settings_json = ... | default: '{"bgColor":"#YOUR_COLOR",...}' %}
   ```

5. **Deploy:**
   ```bash
   shopify app deploy
   ```

## Benefits

✅ **Immediate Visibility** - Button shows right away, no setup needed
✅ **User Friendly** - Great first impression
✅ **Customizable** - User can edit anytime
✅ **Resilient** - Multiple fallback mechanisms
✅ **Professional** - Polished, complete product

## Troubleshooting

### Defaults not appearing?

1. Check webhooks are registered: `shopify app logs`
2. Manually trigger by visiting Form page
3. Check GraphQL metafield query above
4. Hard refresh store: Cmd+Shift+R

### Button shows but with wrong colors?

1. Metafield may have stale values
2. Hard refresh browser
3. Or manually update in Form page

### Webhook not firing?

1. Redeploy app: `shopify app deploy`
2. Check app logs: `shopify app logs`
3. Webhook may need permission scopes
4. Restart dev server
