(function(c){

    c.nextTick = function() {
        // Content Security Policy (CSP)
        // http://code.google.com/chrome/extensions/contentSecurityPolicy.html
        var me = this;
        setTimeout(function(){
            me.tick();
        },this.tickDelay);
    };
    
    c.setSkin = function(skinId) {
        this.skinId = skinId || CoolClock.config.defaultSkin;
        return this;
    };
    
    c.setOffset = function(gmtOffset) {
        this.gmtOffset = gmtOffset;
        return this;
    };
    
    c.setRadius = function(displayRadius) {
        this.displayRadius = displayRadius || CoolClock.config.defaultRadius;
        this.canvas.setAttribute("width",this.displayRadius*2);
        this.canvas.setAttribute("height",this.displayRadius*2);
        this.canvas.style.width = this.displayRadius*2 + "px";
        this.canvas.style.height = this.displayRadius*2 + "px";
        this.scale = this.displayRadius / this.renderRadius;
        this.ctx.scale(this.scale,this.scale);
        return this;
    };
    
    c.setSecondHand = function(enable) {
        this.showSecondHand = enable;
        this.tickDelay = CoolClock.config[ this.showSecondHand ? "tickDelay" : "longTickDelay"];
        return this;
    };
    
    c.setShowDigital = function(enable) {
        this.showDigital = enable;
        return this;
    };
    
})(CoolClock.prototype);
