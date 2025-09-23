async function ensureOffscreenDocument() {
  if (chrome.offscreen && (await chrome.offscreen.hasDocument())) {
    return;
  }
  if (!chrome.offscreen) {
    console.warn('chrome.offscreen API is not available. The dynamic icon may not update.');
    return;
  }
  try {
    // https://developer.chrome.com/docs/extensions/reference/api/offscreen
    await chrome.offscreen.createDocument({
      url: 'src/background.html',
      reasons: [chrome.offscreen.Reason.BLOBS],
      justification: 'Render a canvas clock in an offscreen document and update the action icon periodically.'
    });
  } catch (e) {
    // Ignore the error if the document already exists
    if (!/exists/i.test(String(e))) {
      console.error('Failed to create offscreen document:', e);
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  ensureOffscreenDocument();
});

chrome.runtime.onStartup.addListener(() => {
  ensureOffscreenDocument();
});
