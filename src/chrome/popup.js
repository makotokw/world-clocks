(function($){
    var crx = chrome.extension, background = crx.getBackgroundPage(), w = WorldClocks, extension_id = w.msg('@@extension_id');
    //localStorage.clear();
    var timeZones = [
        {value:"-12",label:"(GMT -12:00) Eniwetok, Kwajalein"},
        {value:"-11",label:"(GMT -11:00) Midway Island, Samoa"},
        {value:"-10",label:"(GMT -10:00) Hawaii"},
        {value:"-9",label:"(GMT -9:00) Alaska"},
        {value:"-8",label:"(GMT -8:00) Pacific Time (US &amp; Canada)"},
        {value:"-7",label:"(GMT -7:00) Mountain Time (US &amp; Canada)"},
        {value:"-6",label:"(GMT -6:00) Central Time (US &amp; Canada), Mexico City"},
        {value:"-5",label:"(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima"},
        {value:"-4.5",label:"(GMT -4:30) Caracas"},
        {value:"-4",label:"(GMT -4:00) Atlantic Time (Canada), La Paz"},
        {value:"-3.5",label:"(GMT -3:30) Newfoundland"},
        {value:"-3",label:"(GMT -3:00) Brazil, Buenos Aires, Georgetown"},
        {value:"-2",label:"(GMT -2:00) Mid-Atlantic"},
        {value:"-1",label:"(GMT -1:00) Azores, Cape Verde Islands"},
        {value:"0",label:"(GMT) Western Europe Time, London, Lisbon, Casablanca"},
        {value:"1",label:"(GMT +1:00) Brussels, Copenhagen, Madrid, Paris"},
        {value:"2",label:"(GMT +2:00) Kaliningrad, South Africa"},
        {value:"3",label:"(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg"},
        {value:"3.5",label:"(GMT +3:30) Tehran"},
        {value:"4",label:"(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi"},
        {value:"4.5",label:"(GMT +4:30) Kabul"},
        {value:"5",label:"(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent"},
        {value:"5.5",label:"(GMT +5:30) Bombay, Calcutta, Madras, New Delhi"},
        {value:"5.75",label:"(GMT +5:45) Kathmandu"},
        {value:"6",label:"(GMT +6:00) Almaty, Dhaka, Colombo"},
        {value:"6.5",label:"(GMT +6:30) Rangoon"},
        {value:"7",label:"(GMT +7:00) Bangkok, Hanoi, Jakarta"},
        {value:"8",label:"(GMT +8:00) Beijing, Perth, Singapore, Hong Kong"},
        {value:"9",label:"(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk"},
        {value:"9.5",label:"(GMT +9:30) Adelaide, Darwin"},
        {value:"10",label:"(GMT +10:00) Eastern Australia, Guam, Vladivostok"},
        {value:"11",label:"(GMT +11:00) Magadan, Solomon Islands, New Caledonia"},
        {value:"12",label:"(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"},
        {value:"13",label:"(GMT +13:00) Nuku'alofa"}
    ];
    var $today = $('#today'), $timezone = $('<select/>');
    $.each(timeZones,function(i,t){ $timezone.append('<option value="'+t.value+'">'+t.label+'</option>'); });
    
    $('#copyright').html(w.msg('APP_TITLE') + ' ' + background.getVersion());
    
    // localize
    var messages = {
        'size_label':'SIZE_LABEL',
        'skin_label':'SKIN_LABEL',
        'column_label':'COLUMN_LABEL',
        'show_second_hand_label':'SECOND_HAND_LABEL',
        'show_digital_clock_label':'SECOND_DIGITAL_CLOCK_LABEL',
        'set_title_label':'CHANGE_TITLE_HELP',
        'order_label':'CHANGE_ORDER_HELP'
    };
    $.each(messages,function(key,value){
        $('#' + key).html(w.msg(value));
    });
    
    var radius = w.pref.get('radius',40),
        skin = w.pref.get('skin','chunkySwiss'),
        showSecondHand = ("false" != w.pref.get('showSecondHand',"true")),
        showDigitalClock = ("false" != w.pref.get('showDigitalClock',"true")),
        showFooter = ("false" != w.pref.get('showFooter',"true")),
        column = w.pref.get('column',4),
        margin = 5,
        width = radius*2
        ;
    var $list = $('#clocks').disableSelection();
    var localeTime = new Date(), localeOffset = (localeTime.getTimezoneOffset()/(-60.0));
    var locales = {_length:0}, default_locales = [
        {label:w.msg('LOCAL_TIME'),offset:localeOffset, dst:0},
        {label:w.msg('LONDON'),offset:'0', dst:0},
        //{label:w.msg('VANCOUVER'),offset:'-8', dst:0},
        {label:w.msg('SANJOSE'),offset:'-8', dst:0},
        {label:w.msg('TOKYO'), offset:'9', dst:0}
    ];
    
    if (!showFooter) {
        $('#footer').remove();
    }
    
    { // optoins
    
        $.fn.extend({
            editColumn: function() {
                var $edit = $(this).val(column);
                function cancel() {
                    $edit.val(column);
                }
                function submit() {
                    var c = $edit.val();
                    c = parseInt(c);
                    if (c > 0 && c <= 10) {
                        column = c;
                        w.pref.set('column',column);
                        resize();
                    } else {
                        $edit.val(column);
                    }
                }
                $edit.keydown(function(e){
                    if (e.keyCode == 13) submit();
                    else if (e.keyCode == 27) cancel();
                }).blur(function(){submit();});
            },
            editLabel: function(l) {
                var $self = $(this), editing = false;
                $(this).click(function(e){
                    if (editing || !$list.hasClass('edit_mode')) return false;
                    editing = true;
                    var revert = $self.html(), $edit = $('<input type="text" value="' + revert + '"/>');
                    $self.empty().append($edit);
                    function cancel() {
                        $self.html(revert);
                        editing = false;
                    }
                    function submit() {
                        l.label = $edit.val();
                        $self.html(l.label);
                        editing = false;
                        saveLocales();
                    }
                    $edit.keydown(function(e){
                        if (e.keyCode == 13) submit();
                        else if (e.keyCode == 27) cancel();
                    }).blur(function(){submit();}).focus();
                });
            },
            editTimezone:function() {
                var $self = $(this), id = $self.parent().attr('id'), cbxid = id+'_dst', l = locales[id];
                var $tz = $('<div class="timezone"/>'),
                    $select = $timezone.clone(),
                    $check = $('<input id="'+cbxid+'" class="dst" type="checkbox"/>').attr('checked',l.dst==1);
                function onTimezoneChanged() {
                    l.offset = parseFloat($select.val());
                    l.dst = $check.attr('checked') ? 1 : 0;
                    l.coolClock.setOffset(l.offset + l.dst);
                    l.coolClock.refreshDisplay();
                    saveLocales();
                }
                $tz.append($select.change(onTimezoneChanged).val(l.offset));
                $tz.append($check.change(onTimezoneChanged)).append('<label for="'+cbxid+'">'+w.msg('DST_LABEL')+'</label>');
                $self.after($tz);
            }
        });
    
        var $option_header = $('#option_header'),
            $option_label = $('#option_label'),
            $option_content = $('#option_content');
            $option_button = $('#option_button').attr({title:w.msg('EDIT_HELP')})
            option_open_label = w.msg('POPUP_OPTION_OPEN'),
            option_close_label = w.msg('POPUP_OPTION_CLOSE')
            ;
        $option_label.toggle(
            function(){ // open option
                $list.addClass('edit_mode').sortable({update:function(){saveLocales();}});
                $option_content.show('blind');
                $('li',$list).each(function(i){
                    var id = $(this).attr('id'), l = locales[id];
                    l.editing = true;
                    $('.digital_clock',$(this)).editTimezone();
                });
                $(this).html(option_close_label);
            },
            function(){ // close option
                $list.removeClass('edit_mode').sortable('destroy');
                $option_content.hide();
                $('li',$list).each(function(i){
                    var id = $(this).attr('id'), l = locales[id];
                    l.editing = false;
                });
                
                $('.timezone',$list).remove();
                updateDigitalClock();
                $(this).html(option_open_label);
        }).html(option_open_label);
        
        // add new Clock
        $('#add').attr({title:w.msg('ADD_HELP')}).html(w.msg('ADD_HELP')).click(function(){
            var $li = addClock().hide().fadeIn();
            var id = $li.attr('id'), l = locales[id];
            l.editing = true;
            $('.digital_clock',$li).editTimezone();
            saveLocales();
            resize();
        });
        
        // column
        $('#column_text').editColumn();
        
        // skin
        var $skin_select = $('#skin_select'); $.each(CoolClock.config.skins,function(attr){
            $skin_select.append('<option value="'+attr+'">'+attr+'</option>')
        });
        $skin_select.change(function(){
            skin = $(this).val();
            $('li',$list).each(function(i){
                var id = $(this).attr('id'), cc = locales[id].coolClock;
                cc.setSkin(skin);
                cc.refreshDisplay();
            });
            //background.setSkin(skin);
            w.pref.set('skin',skin);
        }).val(skin);
        
        // size
        $('#size_range').change(function(){
            changeClockSize($(this).val());
        }).val(radius);
        
        // second hand
        $('#show_second_hand').change(function(){
            var show = $(this).attr('checked');
            showSecondHand = show;
            w.pref.set('showSecondHand',show);
            updateCoolClock();
        }).attr({checked:showSecondHand});
        
        // digital
        $('#show_digital_clock').change(function(){
            showDigitalClock = $(this).attr('checked');
            if (showDigitalClock) {
                $list.find('.digital_clock').show();
            } else {
                $list.find('.digital_clock').hide();
            }
            w.pref.set('showDigitalClock',showDigitalClock);
        }).attr({checked:showDigitalClock});
    }
    
    update();
    resize();
    updateDigitalClock();
    setInterval(updateDigitalClock,1000);
    
    function update() {
        var locales = w.pref.get('locales');
        if (locales) locales = JSON.parse(locales);
        if (!locales || locales.length == 0) locales = default_locales;
        $list.empty();
        $.each(locales,function(i,l){addClock(l);});
    }
    
    function resize() {
        var $items = $('li',$list),
            count = $items.length,
            listWidth = ((count == 0) ? column : Math.min(column,count))*(margin*2 + radius*2),
            itemWidth = radius*2
            ;
        $list.css({width:listWidth});
        $items.each(function(i){
            $(this).css({margin:margin,width:itemWidth});
        });
    }
    
    function saveLocales() {
        var al = [];
        $('li',$list).each(function(i){
            var id = $(this).attr('id'), l = locales[id]
            al.push({label:l.label, offset:l.offset, dst:l.dst});
        });
        w.pref.set('locales',JSON.stringify(al));
    }
    function addClock(locale) {
        var i = locales._length++, l = locale || {label:w.msg('LOCAL_TIME'),offset:localeOffset, dst:0};
        var id = 'locale'+i, canvasId = 'clock'+i+'_'+(new Date().valueOf());
        var $li = $('<li/>').attr({id:id}).addClass('clock');
        $li.html('<img class="close" src="images/close.png"/><span class="city">'+l.label+'</span><canvas id="'+canvasId+'"/><span class="digital_clock"></span>');
        $list.append($li);
        l.coolClock = new CoolClock(canvasId, radius, skin, showSecondHand, parseFloat(l.offset) + l.dst);
        locales[id] = l;
        $('.close', $li).attr({title:w.msg('CLOSE_HELP')}).click(function() {
            $(this).parent().fadeOut('fast', function() {
                $(this).remove();
                saveLocales();
                resize();
            });
        });
        $('.city', $li).editLabel(l);
        if (!showDigitalClock) $('.digital_clock').hide();
        return $li;
    }
    function toLocalTime() {
        return new Date(this.getUTCFullYear(),this.getUTCMonth(), this.getUTCDate(), this.getUTCHours(), 
            this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds());
    }
    function changeClockSize(r) {
        if (!parseInt(r)) return;
        radius = r;
        w.pref.set('radius',radius);
        updateCoolClock();
        resize();
    }
    function updateCoolClock() {
        $('li',$list).each(function(i){
            var id = $(this).attr('id'), cc = locales[id].coolClock;
            cc.setRadius(radius);
            cc.setSecondHand(showSecondHand);
            cc.refreshDisplay();
        });
    }    
    function updateDigitalClock() {
        var now = new Date(), days = w.msg('SHORTDAY_NAMES').split(',');
        $('li',$list).each(function(i){
            var id = $(this).attr('id'), l = locales[id];
            if (!l) return;
            var t = new Date(now.valueOf() + ((parseFloat(l.offset) + parseFloat(l.dst)) * 1000 * 60 * 60)), lt = toLocalTime.apply(t);
            $(this).find('.digital_clock').html(days[lt.getDay()]+' '+ background.toLocaleShortTimeString.call(lt, showSecondHand  && radius > 30));
        });
        $today.html(now.toLocaleDateString());
    }
})(jQuery);