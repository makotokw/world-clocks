(function($){
    $(document).ready(function() {
        var ba = chrome.action,
            canvasId = 'canvas',
            canvas = document.getElementById(canvasId),
            canvasContext = canvas.getContext('2d'),
            coolClock = new CoolClock({
                canvasId:canvasId,
                displayRadius:9,
                skinId:localStorage['ba_skin'] || 'fancy',
                showSecondHand:false,
                showDigital:false})
        ;

        function setSkin(skinId) {
            coolClock.setSkin(skinId);
            coolClock.tick();
            update();
        }
        // TODO: module
        function toLocaleShortTimeString(showScound, use24h) {
            var h = this.getHours(), m = this.getMinutes(), s = this.getSeconds();
            var prefix = '', suffix = '';
            if (use24h) {
                if (h<10) h = '0'+h;
            } else {
                suffix = (h<12) ? ' AM' : ' PM';
                if (h>=12) h -= 12;
                // if (h<10) h = '0'+h;
            }
            if (m<10) m = '0'+m;
            if (s<10) s = '0'+s;
            var time = (showScound) ? h+':'+m+':'+s : h+':'+m;
            return prefix + time + suffix;
        }
        function update() {
            var timeString = toLocaleShortTimeString.call(new Date());
            ba.setTitle({title:timeString});
            ba.setIcon({imageData:canvasContext.getImageData(0, 0,canvas.width,canvas.height)});
        }
        setInterval(update,CoolClock.config.longTickDelay);
        update();

        chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
            if (msg && msg.type === 'setSkin' && msg.skinId) {
                try {
                    setSkin(msg.skinId);
                    sendResponse && sendResponse({ ok: true });
                } catch (e) {
                    sendResponse && sendResponse({ ok: false, error: String(e) });
                }
                return true;
            }
        });
    });
})(jQuery);
