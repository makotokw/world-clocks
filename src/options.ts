import $ from 'jquery';
window.jQuery = window.$ = $;
import 'bootstrap/dist/css/bootstrap.css';
await import('bootstrap/dist/js/bootstrap');
import './coolclock';
import './coolclock_patch';
import './coolclock_moreskins';
import { WorldClocks } from './worldclocks';

(function ($) {
  const w: any = WorldClocks;

  // localize
  const messages = {
    'option_group_icon': 'ICON_GROUP',
    'option_group_popup': 'POPUP_GROUP',
    'skin_label': 'SKIN_LABEL',
    'show_footer_label_text': 'SHOW_FOOTER_LABEL',
    'show_footer_help': 'SHOW_FOOTER_HELP',
  };
  $.each(messages, function (key, value) {
    $('#' + key).html(w.msg(value));
  });
  $('#title').html(w.msg('OPTION_TITLE'));

  const version = chrome.runtime.getManifest().version;
  $('#copyright').html(w.msg('APP_TITLE') + ' ' + version);

  // skin
  let skin = w.pref.get('ba_skin'),
    $skin_select = $('#skin_select');
  $.each((CoolClock as any).config.skins, function (attr: any) {
    $skin_select.append('<option value="' + attr + '">' + attr + '</option>');
  });
  $skin_select.change(function () {
    skin = $(this).val();
    try {
      chrome.runtime.sendMessage({
        type: 'setSkin',
        target: 'offscreen',
        skinId: skin
      }).then(() => {});
    } catch (e) {
    }
    w.pref.set('ba_skin', skin);
  }).val(skin);

  // footer
  const showFooter = ('false' != w.pref.get('showFooter', 'true'));
  $('#show_footer').change(function () {
    const show = $(this).is(':checked');
    w.pref.set('showFooter', show);
  }).attr({ checked: showFooter });

})(jQuery);
