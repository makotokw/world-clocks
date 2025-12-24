import './coolclock';
import './coolclock_patch';
import './coolclock_moreskins';

document.addEventListener('DOMContentLoaded', () => {
  const canvasId = 'canvas';
  const canvas = document.getElementById(canvasId);
  const canvasContext = canvas.getContext('2d');
  const coolClock = new CoolClock({
    canvasId: canvasId,
    displayRadius: 9,
    skinId: localStorage['ba_skin'] || 'fancy',
    showSecondHand: false,
    showDigital: false,
  });

  function setSkin(skinId) {
    coolClock.setSkin(skinId);
    coolClock.tick();
  }

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message || message.target !== 'offscreen') {
      return;
    }
    if (message.type === 'drawClock') {
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      sendResponse({
        width: imageData.width,
        height: imageData.height,
        data: Array.from(imageData.data),
      });
    } else if (message.type === 'setSkin') {
      setSkin(message.skinId);
    }
  });
});
