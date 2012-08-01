(function($){
    var crx = chrome.extension, bg = crx.getBackgroundPage(), w = WorldClocks;
    
    // localize
    var messages = {
        'option_group_icon':'ICON_GROUP',
        'option_group_popup':'POPUP_GROUP',
        'skin_label':'SKIN_LABEL',
        'show_footer_label_text':'SHOW_FOOTER_LABEL',
        'show_footer_help':'SHOW_FOOTER_HELP'
    };
    $.each(messages,function(key,value){
        $('#' + key).html(w.msg(value));
    });
    $('#title').html(w.msg('OPTION_TITLE'));

    $('#copyright').html(w.msg('APP_TITLE') + ' ' + bg.getVersion());

    // skin
    var skin = w.pref.get('ba_skin'),
        $skin_select = $('#skin_select'); $.each(CoolClock.config.skins,function(attr){
        $skin_select.append('<option value="'+attr+'">'+attr+'</option>')
    });
    $skin_select.change(function(){
        skin = $(this).val();
        bg.setSkin(skin);
        w.pref.set('ba_skin',skin);
    }).val(skin);
    
    // footer
    var showFooter = ("false" != w.pref.get('showFooter',"true"));
    $('#show_footer').change(function(){
        var show = $(this).is(':checked');
        w.pref.set('showFooter',show);
    }).attr({checked:showFooter});
    
})(jQuery);