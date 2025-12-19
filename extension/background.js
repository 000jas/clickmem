// Auto-capture state (default enabled)
let isAutoCaptureEnabled = true;
let captureDelay = 3000; // Wait 3 seconds after page load

// Load settings from storage
chrome.storage.sync.get(['autoCaptureEnabled', 'captureDelay'], (result) => {
  isAutoCaptureEnabled = result.autoCaptureEnabled !== undefined ? result.autoCaptureEnabled : true;
  captureDelay = result.captureDelay || 3000;
  updateBadge();
});

// Listen for storage changes (when user toggles in popup)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.autoCaptureEnabled) {
    isAutoCaptureEnabled = changes.autoCaptureEnabled.newValue;
    updateBadge();
  }
  if (changes.captureDelay) {
    captureDelay = changes.captureDelay.newValue;
  }
});

// Update badge to show auto-capture status
function updateBadge() {
  if (isAutoCaptureEnabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#8b5cf6' });
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#6b7280' });
  }
}

// URLs to skip (internal pages, extensions, etc.)
const skipUrls = [
  'chrome://',
  'chrome-extension://',
  'about:',
  'edge://',
  'localhost:3001', // Skip our own server
  'view-source:',
  'file://'
];

function shouldSkipUrl(url) {
  if (!url) return true;
  return skipUrls.some(skip => url.startsWith(skip));
}

// Track recently captured URLs to avoid duplicates
const recentlyCaptured = new Set();
const CAPTURE_COOLDOWN = 60000; // 1 minute cooldown per URL

// Listen for tab updates (page loads)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only capture when:
  // 1. Auto-capture is enabled
  // 2. Page has finished loading
  // 3. URL is not in skip list
  // 4. URL hasn't been captured recently
  if (
    isAutoCaptureEnabled &&
    changeInfo.status === 'complete' &&
    tab.url &&
    !shouldSkipUrl(tab.url) &&
    !recentlyCaptured.has(tab.url)
  ) {
    // Wait a bit for page to fully render
    setTimeout(() => {
      capturePageAutomatically(tabId, tab.url);
    }, captureDelay);
  }
});

// Automatic capture function
async function capturePageAutomatically(tabId, url) {
  try {
    // Mark as captured to avoid duplicates
    recentlyCaptured.add(url);
    setTimeout(() => {
      recentlyCaptured.delete(url);
    }, CAPTURE_COOLDOWN);

    // Extract page data
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageData
    });

    if (!result || !result.result) {
      console.log('Failed to extract data from:', url);
      return;
    }

    const pageData = result.result;

    // Format data for server
    const captureData = {
      ...pageData,
      tags: [], // No manual tags in auto-capture
      notes: '', // No manual notes in auto-capture
      capturedAt: new Date().toISOString()
    };

    const formattedText = formatDataForServer(captureData);

    // Send to backend
    const response = await fetch('http://localhost:3001/receive_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: formattedText
      })
    });

    if (response.ok) {
      console.log('✅ Auto-captured:', pageData.title);
      // Flash badge green briefly
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
      setTimeout(() => {
        updateBadge();
      }, 2000);
    } else {
      console.error('Failed to capture:', url, response.status);
    }

  } catch (error) {
    console.error('Auto-capture error:', error);
  }
}

// Function to extract page data (runs in page context)
function extractPageData() {
  return {
    title: document.title,
    url: window.location.href,
    textContent: document.body.innerText.trim().substring(0, 5000),
    metaDescription: document.querySelector('meta[name="description"]')?.content || '',
    ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
    favicon: document.querySelector('link[rel*="icon"]')?.href || ''
  };
}

// Helper function to format data
function formatDataForServer(captureData) {
  let formattedText = `Title: ${captureData.title || 'Untitled'}\n`;
  formattedText += `URL: ${captureData.url || 'No URL'}\n`;
  formattedText += `Captured: ${captureData.capturedAt}\n\n`;
  
  if (captureData.metaDescription) {
    formattedText += `Description: ${captureData.metaDescription}\n\n`;
  }
  
  const content = captureData.textContent || 'No content available';
  formattedText += `Content:\n${content}`;
  
  if (formattedText.length < 20) {
    formattedText += '\n\nThis is a captured web page from ClickMem extension.';
  }
  
  return formattedText;
}

// Listen for messages from popup (manual capture)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action);
  
  if (request.action === 'manualCapture') {
    // Handle manual capture asynchronously
    capturePageManually(request.tabId, request.url)
      .then(result => {
        console.log('Manual capture success:', result);
        sendResponse(result);
      })
      .catch(error => {
        console.error('Manual capture error:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
});

// Manual capture function
async function capturePageManually(tabId, url) {
  try {
    // Extract page data
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      function: extractPageData
    });

    if (!result || !result.result) {
      throw new Error('Failed to extract page data');
    }

    const pageData = result.result;

    // Format data for server
    const captureData = {
      ...pageData,
      tags: ['manual'], // Tag as manual capture
      notes: 'Manually captured from extension',
      capturedAt: new Date().toISOString()
    };

    const formattedText = formatDataForServer(captureData);

    // Send to backend
    const response = await fetch('http://localhost:3001/receive_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: formattedText
      })
    });

    if (response.ok) {
      console.log('✅ Manually captured:', pageData.title);
      return { success: true, title: pageData.title };
    } else {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

  } catch (error) {
    console.error('Manual capture error:', error);
    throw error;
  }
}