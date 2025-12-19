// content.js
(function fetchPageData() {
  const pageData = {
    title: document.title || null,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    language: document.documentElement.lang || null,
    userAgent: navigator.userAgent,
    textContent: (document.body && document.body.innerText) ? document.body.innerText.trim() : ''
  };

  // Minimal size check
  if (!pageData.textContent || pageData.textContent.length < 20) {
    console.warn('Content too small to capture.');
    return;
  }

  // Backend endpoint (change to your server URL)
  const BACKEND_URL = "http://localhost:3001/receive_data";

  // We send raw text to match the server example you provided.
  // If you want to send JSON, change the Content-Type and body accordingly.
  fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    // You can embed some minimum metadata at the top of the body if you want:
    body: `URL: ${pageData.url}\nTITLE: ${pageData.title}\nTIMESTAMP: ${pageData.timestamp}\n\n---BEGIN_CONTENT---\n${pageData.textContent}\n---END_CONTENT---`
  })
  .then(async resp => {
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Upload failed", resp.status, errText);
    } else {
      console.log("Page snapshot uploaded successfully.");
      // Optionally read structured response for immediate UI feedback
      try {
        const json = await resp.json();
        console.log("Structured data:", json);
      } catch (e) { /* no action */ }
    }
  })
  .catch(err => {
    console.error("Network/upload error", err);
  });
})();