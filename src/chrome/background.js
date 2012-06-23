(function($){
    $(document).ready(function() {
        var ba = chrome.browserAction,
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
        function toLocaleShortTimeString(showScound) {
            var h = this.getHours(), m = this.getMinutes(), s = this.getSeconds();
            if (h<10) h = '0'+h;
            if (m<10) m = '0'+m;
            if (s<10) s = '0'+s;
            return (showScound) ?  h+':'+m+':'+s : h+':'+m;
        }
        function update() {
            var timeString = toLocaleShortTimeString.call(new Date());
            ba.setTitle({title:timeString});
            //ba.setBadgeText({text:timeString});
            ba.setIcon({imageData:canvasContext.getImageData(0, 0,canvas.width,canvas.height)});
        }
        //ba.setBadgeBackgroundColor({color:[0,230,138,115]});
        setInterval(update,CoolClock.config.longTickDelay);
        update();
        window.setSkin = setSkin;
        window.toLocaleShortTimeString = toLocaleShortTimeString;
    });
})(jQuery);