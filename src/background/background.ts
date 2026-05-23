import WorldClocks from '@/common/scripts/world-clocks';
import CoolClock from '@/common/scripts/coolclock-more-skins';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const canvasContext = canvas.getContext('2d')!;
  const coolClock = new CoolClock({
    canvasId: canvas.id,
    displayRadius: 9,
    skin: WorldClocks.pref.get('ba_skin', 'chunkySwiss'),
    showSecondHand: false,
    showDigital: false,
  });

  chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
    if (!message || message.target !== 'offscreen') {
      return;
    }
    if (message.type === 'drawClock') {
      coolClock.setSkin(WorldClocks.pref.get('ba_skin', 'chunkySwiss') as string).tick()
      const imageData = canvasContext.getImageData(0, 0, canvas.width, canvas.height);
      sendResponse({
        width: imageData.width,
        height: imageData.height,
        data: Array.from(imageData.data),
      });
    }
  });
});
