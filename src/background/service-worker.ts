import { toLocaleShortTimeString } from '@/common/scripts/time-utils';

/**
 * @see https://developer.chrome.com/docs/extensions/reference/api/offscreen
 */
async function setupOffscreenDocument() {
  if (!chrome.offscreen) {
    console.warn('chrome.offscreen API is not available. The dynamic icon may not update.');
    return;
  }
  const OFFSCREEN_PATH = 'src/background/background.html';
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl],
  });
  if (existingContexts.length > 0) {
    return;
  }
  await chrome.offscreen.createDocument({
    url: offscreenUrl,
    reasons: [chrome.offscreen.Reason.BLOBS],
    justification: 'Render a canvas clock in an offscreen document and update the action icon periodically.',
  });
}

const updateClockAlarmName = 'update-clock';
async function setupAlarm() {
  const alarm = await chrome.alarms.get(updateClockAlarmName);
  if (!alarm) {
    await chrome.alarms.create(updateClockAlarmName, { periodInMinutes: 1 });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === updateClockAlarmName) {
    void updateIcon();
  }
});

async function updateIcon() {
  const timeString = toLocaleShortTimeString(new Date());
  await chrome.action.setTitle({ title: timeString });

  const response = await chrome.runtime.sendMessage({
    type: 'drawClock',
    target: 'offscreen',
  });
  if (response) {
    const imageData = new ImageData(
      new Uint8ClampedArray(response.data),
      response.width,
      response.height
    );
    await chrome.action.setIcon({ imageData });
  }
}

async function setup() {
  await setupOffscreenDocument();
  await setupAlarm();
  await updateIcon();
}

/**
 * @see https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
 */
chrome.runtime.onInstalled.addListener(setup);

/**
 * @see https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onStartup
 */
chrome.runtime.onStartup.addListener(setup);
