// Get DOM elements
const pageTitle = document.getElementById('pageTitle');
const pageUrl = document.getElementById('pageUrl');
const autoCaptureToggle = document.getElementById('autoCaptureToggle');
const manualCaptureBtn = document.getElementById('manualCaptureBtn');
const viewLibraryBtn = document.getElementById('viewLibraryBtn');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const statusIndicator = document.getElementById('statusIndicator');

// Load current page info when popup opens
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    const tab = tabs[0];
    const title = tab.title || 'Untitled Page';
    const url = tab.url || 'No URL';
    
    // Check if it's a restricted page
    const isRestrictedPage = url.startsWith('chrome://') || 
                            url.startsWith('chrome-extension://') || 
                            url.startsWith('about:') ||
                            url.startsWith('edge://');
    
    if (pageTitle) {
      pageTitle.textContent = title;
    }
    
    if (pageUrl) {
      if (isRestrictedPage) {
        pageUrl.textContent = '⚠️ Cannot capture system pages';
        pageUrl.style.color = '#f59e0b';
      } else {
        pageUrl.textContent = url;
      }
    }
  } else {
    if (pageTitle) pageTitle.textContent = 'No active tab';
    if (pageUrl) pageUrl.textContent = 'Unable to access tab info';
  }
});

// Load auto-capture state
chrome.storage.sync.get(['autoCaptureEnabled'], (result) => {
  const isEnabled = result.autoCaptureEnabled !== undefined ? result.autoCaptureEnabled : true;
  autoCaptureToggle.checked = isEnabled;
  updateToggleStatus(isEnabled);
});

// Auto-capture toggle handler
autoCaptureToggle.addEventListener('change', (e) => {
  const isEnabled = e.target.checked;
  chrome.storage.sync.set({ autoCaptureEnabled: isEnabled });
  updateToggleStatus(isEnabled);
  
  if (isEnabled) {
    showSuccess('Auto-capture enabled');
  } else {
    showInfo('Auto-capture disabled');
  }
});

function updateToggleStatus(isEnabled) {
  if (isEnabled) {
    updateStatus('Auto-capture ON', 'success');
  } else {
    updateStatus('Auto-capture OFF', 'warning');
  }
}

// Manual Capture button handler
manualCaptureBtn.addEventListener('click', async () => {
  try {
    // Disable button and show loading state
    manualCaptureBtn.disabled = true;
    manualCaptureBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Capturing...</span>';
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      throw new Error('No active tab found');
    }
    
    // Check if it's a restricted page
    const isRestrictedPage = tab.url.startsWith('chrome://') || 
                            tab.url.startsWith('chrome-extension://') || 
                            tab.url.startsWith('about:') ||
                            tab.url.startsWith('edge://');
    
    if (isRestrictedPage) {
      throw new Error('Cannot capture system pages');
    }
    
    // Send message to background script to capture
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'manualCapture',
        tabId: tab.id,
        url: tab.url
      });
      
      if (response && response.success) {
        showSuccess('Page captured successfully!');
        updateStatus('Captured!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to capture page');
      }
    } catch (msgError) {
      // Handle connection errors
      if (msgError.message.includes('Receiving end does not exist')) {
        throw new Error('Extension not loaded properly. Please reload the extension.');
      }
      throw msgError;
    }
  } catch (error) {
    console.error('Manual capture error:', error);
    showError(error.message || 'Failed to capture page');
    updateStatus('Capture failed', 'error');
  } finally {
    // Reset button state
    manualCaptureBtn.disabled = false;
    manualCaptureBtn.innerHTML = '<span class="btn-icon">📸</span><span>Capture Current Page</span>';
  }
});

// View Library button handler
viewLibraryBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:8080' });
});

// Helper functions
function showSuccess(message = 'Page captured successfully!') {
  const msgElement = successMessage.querySelector('span:last-child');
  if (msgElement) msgElement.textContent = message;
  successMessage.classList.remove('hidden');
  setTimeout(() => {
    successMessage.classList.add('hidden');
  }, 3000);
}

function showInfo(message) {
  const msgElement = successMessage.querySelector('span:last-child');
  if (msgElement) msgElement.textContent = message;
  successMessage.classList.remove('hidden');
  setTimeout(() => {
    successMessage.classList.add('hidden');
  }, 2000);
}

function showError(message) {
  if (errorText) errorText.textContent = message;
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 4000);
}

function hideMessages() {
  successMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');
}

function updateStatus(text, type = 'success') {
  const statusText = statusIndicator.querySelector('.status-text');
  const statusDot = statusIndicator.querySelector('.status-dot');
  
  if (statusText) statusText.textContent = text;
  
  // Update dot color based on status
  if (statusDot) {
    if (type === 'success') {
      statusDot.style.background = '#10b981'; // green
    } else if (type === 'warning') {
      statusDot.style.background = '#f59e0b'; // orange
    } else if (type === 'error') {
      statusDot.style.background = '#ef4444'; // red
    }
  }
}

// Settings link handler
const settingsLink = document.getElementById('settingsLink');
if (settingsLink) {
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    showInfo('Settings coming soon!');
  });
}

// Help link handler
const helpLink = document.getElementById('helpLink');
if (helpLink) {
  helpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: 'https://github.com/yourusername/clickmem' });
  });
}
