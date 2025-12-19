# ClickMem Auto-Capture Guide

## How It Works

The extension now **automatically captures every page you visit** when enabled!

### Features

✅ **Auto-capture toggle** - Turn on/off from the popup
✅ **Smart filtering** - Skips internal pages (chrome://, extensions, etc.)
✅ **Duplicate prevention** - Won't re-capture the same URL for 1 minute
✅ **3-second delay** - Waits for pages to fully load before capturing
✅ **Visual feedback** - Badge shows "ON/OFF" status, flashes green on capture
✅ **Silent operation** - Captures in background, no interruption

## How to Use

### 1. Enable Auto-Capture

- Click the extension icon
- Toggle "Auto-Capture" to ON (enabled by default)
- Badge shows "ON" in purple

### 2. Browse Normally

- Just visit any webpage
- Extension automatically captures after 3 seconds
- Badge briefly flashes green (✓) when captured

### 3. Disable When Needed

- Click extension icon
- Toggle "Auto-Capture" to OFF
- Badge shows "OFF" in gray

## What Gets Captured

For each page:

- **Title** - Page title
- **URL** - Full URL
- **Content** - First 5000 characters of text
- **Meta Description** - SEO description
- **OpenGraph Image** - Social media preview image
- **Favicon** - Page icon
- **Timestamp** - Exact capture time

## What Gets Skipped

The extension WON'T capture:

- `chrome://` pages (browser internals)
- `chrome-extension://` pages (other extensions)
- `about:` pages
- `edge://` pages (if using Edge)
- `file://` local files
- `localhost:3001` (your own server)
- Pages captured in the last 60 seconds (cooldown)

## Badge Indicators

| Badge         | Meaning               |
| ------------- | --------------------- |
| `ON` (purple) | Auto-capture enabled  |
| `OFF` (gray)  | Auto-capture disabled |
| `✓` (green)   | Just captured a page  |

## Technical Details

### Background Process

- Runs as Chrome service worker
- Listens to `chrome.tabs.onUpdated`
- Triggers when `status === 'complete'`
- Waits 3 seconds for full page render

### Storage

- Uses `chrome.storage.sync` for settings
- Setting syncs across devices (if Chrome sync enabled)
- State persists after browser restart

### Cooldown System

- Prevents duplicate captures
- 60-second cooldown per unique URL
- Resets after 1 minute

### Data Flow

```
Page Load → Wait 3s → Extract Data → Send to Server → NLP Analysis → Supabase
```

## Settings (Coming Soon)

Future features:

- ⏱️ Adjustable capture delay (1-10 seconds)
- 🚫 Custom URL blacklist (skip specific domains)
- 📊 Capture statistics (pages/day, total captured)
- 🎯 Selective capture (only certain domains)
- 🏷️ Auto-tagging rules (by domain/keyword)

## Troubleshooting

### Extension not capturing

1. Check badge shows "ON"
2. Wait 3 seconds after page loads
3. Check console for errors (F12 → Console)
4. Verify server is running (localhost:3001)

### Too many captures

- Disable auto-capture
- Add domains to skip list (edit `background.js`)

### Server errors

- Check Node server is running: `node server/server.js`
- Check Python NLP is running: `python server/nlp_service.py`
- Verify Supabase credentials in `.env`

## Viewing Captured Pages

1. Click extension icon
2. Click "View Library" button
3. Opens frontend at `localhost:8080`
4. Search, filter, and view all captures

## Privacy & Performance

✅ **Local processing** - All AI runs on your machine
✅ **Your data** - Stored in your Supabase instance
✅ **No tracking** - No analytics or external calls
✅ **Efficient** - Minimal memory usage, smart cooldowns
✅ **Async** - Won't slow down browsing

## Deployment Notes

When deployed to production:

- Update `localhost:3001` → Production API URL
- Update `localhost:8080` → Production frontend URL
- Update `host_permissions` in `manifest.json`
- Test auto-capture with production endpoints

## Example Use Cases

📚 **Research** - Auto-capture articles, papers, documentation
🛍️ **Shopping** - Save product pages for comparison
🎓 **Learning** - Capture tutorials, courses, guides
📰 **News** - Build personal news archive
💡 **Ideas** - Never lose inspiration from web browsing
🔖 **Bookmarks++** - Searchable, AI-analyzed bookmarks

---

**Tip**: Use the toggle frequently - enable when researching, disable when casually browsing!
