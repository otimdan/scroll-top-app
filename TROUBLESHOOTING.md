# Troubleshooting: Theme Extension Not Showing

## Issue: Button doesn't appear in store

### Solution 1: Using the Block (Recommended)

**Steps:**
1. Go to **Shopify Admin** → **Sales Channels** → **Online Store**
2. Click **Customize** (or edit your theme)
3. Go to **theme.liquid** or any section
4. Click **Add block** (or **+** icon)
5. Search for and select **"Scroll to Top"** block
6. **Save** the theme

The block will now appear on your store with the settings from your app.

---

### Solution 2: Using the Snippet (Automatic)

**If the block doesn't work, use the snippet instead:**

1. In **theme editor**, go to **theme.liquid**
2. Find the line with `</body>`
3. Add this line just before it:
   ```liquid
   {% render 'scroll-to-top' %}
   ```
4. **Save** the theme

The button will automatically appear with app settings.

---

## Checklist: Why Button Might Not Show

- [ ] **Did you add the block to a section?**
  - Block won't appear unless added to a section in theme editor
  
- [ ] **Or did you add the snippet to theme.liquid?**
  - Add before `</body>` tag: `{% render 'scroll-to-top' %}`

- [ ] **Settings saved in app?**
  - Go to your app → Form page → Save settings
  - This creates the metafield with button configuration

- [ ] **Theme deployed?**
  - Run: `shopify app deploy`
  - Check deployment completed successfully

- [ ] **Browser cache cleared?**
  - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

- [ ] **Store reloaded?**
  - Close and reopen store page

---

## How to Verify Metafield is Set

**In Shopify Admin GraphQL:**

1. Go to **Admin → Apps and sales channels → App → Configuration**
2. Or use GraphQL Admin API explorer
3. Run this query:

```graphql
{
  shop {
    metafield(namespace: "scroll_top_app", key: "settings") {
      id
      value
    }
  }
}
```

**Expected response:**
```json
{
  "data": {
    "shop": {
      "metafield": {
        "id": "gid://shopify/Metafield/...",
        "value": "{\"bgColor\":\"#28A745\",\"hoverColor\":\"#1C7530\",\"iconColor\":\"#FFFFFF\",\"buttonShape\":\"circle\",\"buttonPosition\":\"right\",\"showOnHome\":false,\"showOnProduct\":false,\"showOnCollection\":false,\"showOnAll\":true}"
      }
    }
  }
}
```

If `metafield` is `null`, the settings haven't been saved yet.

---

## Default Settings (If Metafield Not Set)

If button doesn't show because metafield isn't set, it uses defaults:
- Background color: `#28A745` (green)
- Hover color: `#1C7530` (darker green)
- Icon color: `#FFFFFF` (white)
- Shape: `circle`
- Position: `right`
- Show on all pages: `true`

**To customize:** Save settings in your app admin form → button updates automatically

---

## JavaScript Console Debugging

**Check browser console for errors:**

1. Open store page
2. Right-click → **Inspect** → **Console** tab
3. Look for errors like:
   - `Cannot read property...` - JavaScript error
   - `Failed to parse...` - Metafield parsing issue
   - Look for console.error logs with "Scroll to Top"

---

## Quick Test: Button Should Appear When

✅ Block added to section + app settings saved
✅ Snippet rendered in theme.liquid + app settings saved
✅ Scroll page down more than 300px
✅ Button appears at bottom right (or left if configured)
✅ Click button → smooth scroll to top

---

## If Still Not Working

**Try this diagnostic:**

1. **Verify app is installed:**
   ```bash
   shopify app info
   ```

2. **Check extension deployed:**
   ```bash
   shopify app deploy
   ```

3. **Test API endpoint:**
   - Visit: `https://your-store.myshopify.com/apps/scroll-top-app/settings`
   - Should return JSON with settings

4. **Check logs:**
   ```bash
   shopify app logs
   ```

5. **Reinstall extension:**
   ```bash
   shopify app delete
   shopify app deploy
   ```

---

## Common Issues

### "Block not found in theme editor"
- Extension not deployed: Run `shopify app deploy`
- Wrong app not installed in dev store
- Clear browser cache

### "Button appears but doesn't work"
- JavaScript error in console
- Check color values are valid hex
- Verify scroll trigger (scroll > 300px)

### "Settings not updating"
- Metafield not being saved
- Check app.form.jsx action handler
- Verify GraphQL mutation succeeds

### "Wrong colors showing"
- Metafield has old values
- Edit settings in app and save
- Hard refresh browser (Cmd+Shift+R)

---

## Contact Support

If still not working:
1. Check browser console for errors
2. Verify metafield is set (GraphQL query above)
3. Check app logs: `shopify app logs`
4. Ensure theme extension deployed: `shopify app deploy`
