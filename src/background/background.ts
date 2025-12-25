import CoolClock from '@/common/scripts/coolclock-more-skins';

document.addEventListener('DOMContentLoaded', () => {
  const canvasId = 'canvas';
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  const canvasContext = canvas.getContext('2d')!;
  const coolClock = new CoolClock({
    canvasId: canvasId,
    displayRadius: 9,
    skin: localStorage['ba_skin'] || 'fancy',
    showSecondHand: false,
    showDigital: false,
  });

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
      coolClock.setSkin(message.skinId as string).tick();
    }
  });
});
