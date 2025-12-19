# Memory Lane Chrome Extension

## 🎯 How It Works

The extension captures web page content and sends it to your server for AI processing and storage.

### Data Flow

```
Web Page → Extension Popup → Server (localhost:3001) → Gemini AI → Supabase
```

## 🚀 Setup Instructions

### 1. Start the Server

```bash
cd /Users/ojasdhapse/Ojas/projects/genathon/server
node server.js
```

Server will run on: `http://localhost:3001`

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the folder: `/Users/ojasdhapse/Ojas/projects/genathon/extension`
5. Extension is now installed! 🎉

### 3. Use the Extension

1. Navigate to any webpage you want to save
2. Click the **Memory Lane** extension icon
3. The popup will show:
   - Current page title and URL
   - Optional tags input (comma-separated)
   - Optional notes textarea
4. Click **Capture Page** button
5. Data is sent to server → processed by Gemini AI → saved to Supabase

## 📦 What Gets Captured

- **Page Title**: Document title
- **URL**: Current page URL
- **Content**: Visible text (first 5000 chars)
- **Meta Description**: If available
- **OG Image**: If available
- **Favicon**: If available
- **Tags**: User-added tags
- **Notes**: User-added notes
- **Timestamp**: When captured

## 🔧 Files Overview

### Extension Files

- **manifest.json**: Extension configuration
- **popup.html**: User interface
- **popup.css**: Styling
- **popup.js**: Main logic (captures data + sends to server)
- **content.js**: Page data extraction (legacy, not used by popup)
- **background.js**: Background service worker (legacy)

### Key Functions

**popup.js**:

- `extractPageData()`: Extracts data from current page
- `formatDataForServer()`: Formats data for server API
- `captureBtn` event: Sends data to server
- `updateStatus()`: Updates UI status indicator

## 🌐 Server API

### Endpoint: POST `/receive_data`

**Request:**

```json
{
  "text": "Title: Example Page\nURL: https://example.com\n\nContent: ..."
}
```

**Response:**

```json
{
  "title": "Example Page",
  "summary": "AI-generated summary",
  "keywords": ["keyword1", "keyword2"],
  "emotions": ["informative"],
  "timestamp": "2025-11-28T...",
  "source_url": "https://example.com",
  "media_urls": []
}
```

## 🎨 UI Features

- **Status Indicator**: Shows ready/processing/error states
- **Live Preview**: Displays current page info
- **Form Inputs**: Tags and notes
- **Success/Error Messages**: User feedback
- **View Library Button**: Opens your main app

## 🔄 Reloading After Changes

After modifying extension files:

1. Go to `chrome://extensions/`
2. Find "Memory Lane Snapshot"
3. Click the **Reload** icon (🔄)

## 🐛 Debugging

**View Console Logs:**

- Right-click extension icon → Inspect popup
- Open Developer Tools
- Check Console tab

**Common Issues:**

1. **Server not running**: Start server first
2. **CORS errors**: Server has CORS enabled for all origins
3. **Permission errors**: Check manifest.json permissions
4. **No response**: Verify server is on port 3001

## 📝 Next Steps

- [ ] Add error retry logic
- [ ] Add offline queue
- [ ] Add screenshot capture
- [ ] Add batch capture
- [ ] Add settings page
- [ ] Add keyboard shortcuts
