# Metafield-Based Scroll-to-Top Extension Setup

## Architecture Overview

This implementation uses Shopify app metafields to store button settings centrally, ensuring merchants can't accidentally edit them from the theme editor.

```
┌─────────────────┐
│   Shopify App   │
│  (Admin Panel)  │
└────────┬────────┘
         │
         │ Saves settings via GraphQL
         │
         ▼
┌──────────────────────────┐
│  Shop Metafield          │
│  namespace: scroll_top_  │
│  key: settings           │
│  value: JSON config      │
└────────┬─────────────────┘
         │
         │ Reads settings
         │
         ▼
┌────────────────────────┐
│  Theme Extension       │
│  (Block/Snippet)       │
│  Displays Button       │
└────────────────────────┘
```

## How It Works

### 1. **App Saves to Metafield** (app.form.jsx)

When merchant saves settings in the app admin:

```javascript
// GraphQL Mutation
mutation SetShopMetafield($input: ShopMetafieldsSetInput!) {
  shopMetafieldsSet(input: $input) {
    metafields {
      id
      namespace
      key
      value
    }
  }
}

// Variables
{
  "input": {
    "metafields": [
      {
        "namespace": "scroll_top_app",
        "key": "settings",
        "type": "json",
        "value": "{\"bgColor\":\"#28A745\",\"hoverColor\":\"#1C7530\",\"iconColor\":\"#FFFFFF\",...}"
      }
    ]
  }
}
```

### 2. **Theme Reads from Metafield** (scroll-to-top.liquid)

The block reads directly from the shop metafield:

```liquid
{% assign settings_json = shop.metafields.scroll_top_app.settings.value | default: '{"bgColor":"#28A745",...}' %}

<script>
  const buttonSettings = {{ settings_json | json }};
</script>
```

### 3. **No Admin UI in Block**

The block has a minimal schema with NO editable fields:

```liquid
{% schema %}
{
  "name": "Scroll to Top Button (Read-Only - Managed by App)"
}
{% endschema %}
```

## Benefits

✅ **Single Source of Truth** - Settings only editable in app admin
✅ **Merchant-Proof** - Can't be changed from theme editor
✅ **Native Shopify** - Uses standard metafield API
✅ **No API Calls** - Theme has instant access to settings
✅ **Automatic Sync** - Changes appear immediately in theme
✅ **Fallback Defaults** - Works if metafield doesn't exist yet

## Usage Steps

### Step 1: Configure in App Admin
1. Go to your Shopify app → Form page
2. Set colors, shape, position, pages
3. Click **Save**
4. Settings are saved to `shop.metafields.scroll_top_app.settings`

### Step 2: Add to Theme
1. In theme editor, add **"Scroll to Top Button"** block to a section
2. The block automatically loads settings from the metafield
3. **Note:** No settings to configure - it's read-only!

### Step 3: Deploy
```bash
shopify app deploy
```

## File Structure

```
app/
├── routes/
│   ├── app.form.jsx              ← Saves to metafield
│   └── api.settings.jsx           ← Reads from metafield (for API access)
└── ...

extensions/scroll-top/
├── blocks/
│   └── scroll-to-top.liquid       ← Reads from metafield (read-only schema)
├── snippets/
│   └── scroll-to-top.liquid       ← Alternative: snippet version
└── shopify.extension.toml
```

## Metafield Details

| Property | Value |
|----------|-------|
| Namespace | `scroll_top_app` |
| Key | `settings` |
| Type | `json` |
| Stored On | `Shop` resource |

### Metafield Value Structure

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

## GraphQL Queries

### Read Metafield
```graphql
query GetShopMetafield {
  shop {
    scrollTopSettings: metafield(namespace: "scroll_top_app", key: "settings") {
      id
      value
    }
  }
}
```

### Write Metafield
```graphql
mutation SetShopMetafield($input: ShopMetafieldsSetInput!) {
  shopMetafieldsSet(input: $input) {
    metafields {
      id
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

## Troubleshooting

### Button not appearing?
1. Verify settings saved in app admin
2. Check theme extension is deployed
3. Verify block is added to theme
4. Check browser console for JS errors

### Settings not syncing?
1. Confirm GraphQL mutation succeeded
2. Check metafield namespace/key spelling
3. Use GraphQL admin to verify metafield exists

### How to manually check metafield?
In Shopify admin GraphQL, run:
```graphql
{
  shop {
    metafield(namespace: "scroll_top_app", key: "settings") {
      value
    }
  }
}
```

## Why This Approach?

**Traditional Approach (Block Settings):**
- ❌ Merchants can edit settings in theme editor
- ❌ Inconsistent with app admin settings
- ❌ Can override app settings by mistake

**Metafield Approach:**
- ✅ Single source of truth
- ✅ Merchant-proof (read-only block)
- ✅ Consistent across all stores
- ✅ App maintains full control

## Migration Notes

If upgrading from the old approach:
1. The metafield will be created on first save
2. Database still stores settings as backup
3. You can remove database dependency later if needed
4. No data loss during transition
