import $ from 'jquery';
window.jQuery = window.$ = $;
// Load jQuery UI after jQuery is exposed on window to satisfy its global dependency
await import('jquery-ui-dist/jquery-ui');
import CoolClock from '@/common/scripts/coolclock-more-skins';
import WorldClocks from '@/common/scripts/world-clocks';
import timeZones from '@/common/scripts/time-zones';
import { toLocalTime, toShortDateString, toLocaleShortTimeString } from '@/common/scripts/time-utils';

(function ($) {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  const $timezone = $('<select/>');
  $.each(timeZones, function (i, t) {
    $timezone.append(`<option value="${t.value}">${t.label}</option>`);
  });

  const version = chrome.runtime.getManifest().version;
  $('#copyright').html(WorldClocks.msg('APP_TITLE') + ' ' + version);

  // localize
  const messages = {
    'size_label': 'SIZE_LABEL',
    'skin_label': 'SKIN_LABEL',
    'analog_section': 'ANALOG_SECTION',
    'digital_section': 'DIGITAL_SECTION',
    'column_label': 'COLUMN_LABEL',
    'analog_detail_label': 'DETAIL_LABEL',
    'show_analog_clock_label': 'SHOW_ANALOG_CLOCK_LABEL',
    'show_second_hand_label': 'SHOW_SECOND_HAND_LABEL',
    'digital_detail_label': 'DETAIL_LABEL',
    'digital_clock_font_size_label': 'FONT_SIZE_LABEL',
    'digital_clock_24h_label': 'DIGITAL_CLOCK_24H',
    'show_digital_clock_label': 'SHOW_DIGITAL_CLOCK_LABEL',
    'show_date_label': 'SHOW_DATE_LABEL',
  };

  $.each(messages, function (key, value) {
    $('#' + key).html(WorldClocks.msg(value));
  });

  // noinspection EqualityComparisonWithCoercionJS
  let radius = WorldClocks.pref.get('radius', 40),
    digitalClockFontSize = WorldClocks.pref.get('digitalClockFontSize', 10),
    skin = WorldClocks.pref.get('skin', 'chunkySwiss'),
    showAnalogClock = ('false' != WorldClocks.pref.get('showAnalogClock', 'true')),
    showSecondHand = ('false' != WorldClocks.pref.get('showSecondHand', 'true')),
    showDigitalClock = ('false' != WorldClocks.pref.get('showDigitalClock', 'true')),
    useDigitalClock24h = ('false' != WorldClocks.pref.get('useDigitalClock24h', 'true')),
    showDate = ('false' != WorldClocks.pref.get('showDate', 'true')),
    showFooter = ('false' != WorldClocks.pref.get('showFooter', 'true')),
    column = WorldClocks.pref.get('column', 4),
    margin = 5
  ;
  const $list = $('#clocks').disableSelection();
  const localeTime = new Date(),
    localeOffset = (localeTime.getTimezoneOffset() / (-60.0));
  const locales = { _length: 0 }, default_locales = [
    { label: WorldClocks.msg('LOCAL_TIME'), offset: localeOffset, dst: 0 },
    { label: WorldClocks.msg('LONDON'), offset: '0', dst: 0 },
    { label: WorldClocks.msg('SANJOSE'), offset: '-8', dst: 0 },
    { label: WorldClocks.msg('TOKYO'), offset: '9', dst: 0 },
  ];

  if (!showFooter) {
    $('#footer').remove();
  }

  { // options

    $.fn.extend({
      editColumn: function () {
        const $edit = $(this).val(column);

        function cancel () {
          $edit.val(column);
        }

        function submit () {
          let c = $edit.val();
          c = parseInt(c);
          if (c > 0 && c <= 10) {
            column = c;
            WorldClocks.pref.set('column', column);
            resize();
          } else {
            $edit.val(column);
          }
        }

        $edit.keydown(function (e) {
          if (e.keyCode === 13) submit();
          else if (e.keyCode === 27) cancel();
        }).blur(function () {submit();});
      },
      editLabel: function (l) {
        let $self = $(this), editing = false;
        $(this).click(function () {
          if (editing || !$list.hasClass('edit_mode')) {
            return false;
          }
          editing = true;
          const revert = $self.html(),
            $edit = $(`<input type="text" value="${revert}"/>`);
          $self.empty().append($edit);

          function cancel () {
            $self.html(revert);
            editing = false;
          }

          function submit () {
            l.label = $edit.val();
            $self.html(l.label);
            editing = false;
            saveLocales();
          }

          $edit.keydown(function (e) {
            if (e.keyCode === 13) submit();
            else if (e.keyCode === 27) cancel();
          }).blur(function () {submit();}).focus();
        });
      },
      editTimezone: function () {
        const $self = $(this), id = $self.closest('li').attr('id'),
          cbxid = `${id}_dst`, l = locales[id];
        const $tz = $('<div class="timezone"/>'),
          $select = $timezone.clone(),
          $check = $(`<input id="${cbxid}" class="dst" type="checkbox"/>`).attr('checked', (!!l.dst) as any);

        function onTimezoneChanged () {
          l.offset = parseFloat($select.val() as string);
          l.dst = $check.attr('checked') ? 1 : 0;
          l.coolClock.setOffset(l.offset + l.dst);
          l.coolClock.refreshDisplay();
          saveLocales();
        }

        $tz.append($select.change(onTimezoneChanged).val(l.offset));
        $tz.append($check.change(onTimezoneChanged)).
          append(`<label for="${cbxid}">${WorldClocks.msg('DST_LABEL')}</label>`);
        $self.after($tz);
      },
    });

    const $option_label = $('#option_label'),
      $option_content = $('#option_content'),
      $option_button = $('#option_button'),
      option_open_label = WorldClocks.msg('POPUP_OPTION_OPEN'),
      option_close_label = WorldClocks.msg('POPUP_OPTION_CLOSE')
    ;
    $option_button.attr({ title: WorldClocks.msg('EDIT_HELP') });
    let isOptionOpen = false;
    $option_label.on('click', function (e) {
      e.preventDefault();
      if (!isOptionOpen) { // open option
        $list.addClass('edit_mode');
        if (!$list.data('ui-sortable')) {
          $list.sortable({ update: function () {saveLocales();} });
        }
        $option_content.show('blind' as any);
        $('li', $list).each(function () {
          const id = $(this).attr('id'), l = locales[id];
          l.editing = true;
          $('.date', $(this)).editTimezone();
        });
        $(this).html(option_close_label);
        isOptionOpen = true;
      } else { // close option
        $list.removeClass('edit_mode');
        if ($list.data('ui-sortable')) {
          $list.sortable('destroy');
        }
        $option_content.hide();
        $('li', $list).each(function () {
          const id = $(this).attr('id'), l = locales[id];
          l.editing = false;
        });
        $('.timezone', $list).remove();
        updateDigitalClock();
        $(this).html(option_open_label);
        isOptionOpen = false;
      }
    }).html(option_open_label);

    // add new Clock
    $('#add').
      attr({ title: WorldClocks.msg('ADD_HELP') }).
      html(WorldClocks.msg('ADD_HELP')).
      click(function () {
        const $li = addClock(undefined).hide().fadeIn();
        const id = $li.attr('id'), l = locales[id];
        l.editing = true;
        $('.date', $li).editTimezone();
        saveLocales();
        resize();
      });

    // column
    $('#column_text').editColumn();

    // skin
    const $skin_select = $('#skin_select');
    $.each((CoolClock as any).config.skins, function (attr: any) {
      $skin_select.append(`<option value="${attr}">${attr}</option>`);
    });
    $skin_select.change(function () {
      skin = $(this).val();
      $('li', $list).each(function () {
        const id = $(this).attr('id'), cc = locales[id].coolClock;
        cc.setSkin(skin);
        cc.refreshDisplay();
      });
      WorldClocks.pref.set('skin', skin);
    }).val(skin);

    // size(radius)
    $('#size_range').change(function () {
      changeClockSize($(this).val());
    }).val(radius);

    // fontsize
    $('#digital_clock_font_size_range').change(function () {
      changeDigitalClockFontSize($(this).val());
    }).val(digitalClockFontSize);

    // second hand
    $('#show_second_hand').change(function () {
      showSecondHand = $(this).is(':checked');
      WorldClocks.pref.set('showSecondHand', showSecondHand);
      updateCoolClock();
    }).attr({ checked: showSecondHand });

    // analog clock
    $('#show_analog_clock').change(function () {
      showAnalogClock = $(this).is(':checked');
      if (showAnalogClock) {
        $list.find('.analog_clock').show();
      } else {
        $list.find('.analog_clock').hide();
      }
      console.debug('set showAnalogClock', showAnalogClock);
      WorldClocks.pref.set('showAnalogClock', showAnalogClock);
      updateCoolClock();
    }).attr({ checked: showAnalogClock });

    // digital clock
    $('#show_digital_clock').change(function () {
      showDigitalClock = $(this).is(':checked');
      if (showDigitalClock) {
        $list.find('.digital_clock').show();
      } else {
        $list.find('.digital_clock').hide();
      }
      WorldClocks.pref.set('showDigitalClock', showDigitalClock);
      updateDigitalClock();
    }).attr({ checked: showDigitalClock });

    // digital clock 24h
    $('#digital_clock_24h').change(function () {
      useDigitalClock24h = $(this).is(':checked');
      WorldClocks.pref.set('useDigitalClock24h', useDigitalClock24h);
      updateDigitalClock();
    }).attr({ checked: useDigitalClock24h });

    // date string
    $('#show_date').change(function () {
      showDate = $(this).is(':checked');
      if (showDate) {
        $list.find('.date').show();
      } else {
        $list.find('.date').hide();
      }
      WorldClocks.pref.set('showDate', showDate);
      updateDigitalClock();
    }).attr({ checked: showDate });
  }

  update();
  resize();
  updateDigitalClock();
  setInterval(updateDigitalClock, 1000);

  function update () {
    let locales = WorldClocks.pref.get('locales');
    if (locales) locales = JSON.parse(locales);
    if (!locales || locales.length === 0) locales = default_locales;
    $list.empty();
    $.each(locales, function (i, l) {addClock(l);});
  }

  function resize () {
    const $items = $('li', $list),
      count = $items.length,
      listWidth = ((count === 0) ? column : Math.min(column, count)) * (margin * 2 + radius * 2),
      itemWidth = radius * 2
    ;
    $list.css({ width: listWidth });
    $items.each(function () {
      $(this).css({ margin: margin, width: itemWidth });
    });
  }

  function saveLocales () {
    const al = [];
    $('li', $list).each(function () {
      const id = $(this).attr('id'), l = locales[id];
      al.push({ label: l.label, offset: l.offset, dst: l.dst });
    });
    WorldClocks.pref.set('locales', JSON.stringify(al));
  }

  function addClock (locale) {
    const i = locales._length++, l = locale ||
      { label: WorldClocks.msg('LOCAL_TIME'), offset: localeOffset, dst: 0 };
    const id = `locale${i}`,
      canvasId = `clock${i}_${new Date().valueOf()}`;
    const $li = $('<li/>').attr({ id: id }).addClass('clock');

    const html = '<span class="city">' + l.label + '</span>'
      + '<canvas id="' + canvasId + '" class="analog_clock"' +
      ((showAnalogClock) ? '' : ' style="display:none;"') + '></canvas>'
      + '<span class="digital_clock"' +
      ((showDigitalClock) ? '' : ' style="display:none;"') + '></span>'
      + '<span class="date"' + ((showDate) ? '' : ' style="display:none;"') +
      '></span>'
      + '<a href="#" class="remove btn btn-danger">' +
      WorldClocks.msg('REMOVE_CLOCK_LABEL') + '</a>';

    $li.html(html);
    $('.digital_clock', $li).css({ 'font-size': digitalClockFontSize + 'px' });

    // Don't use hide function for autosizing
    //if (!showAnalogClock) $('.analog_clock', $li).hide();
    //if (!showDigitalClock) $('.digital_clock', $li).hide();
    //if (!showDate) $('.date', $li).hide();
    $('.remove', $li).click(function () {
      $(this).parent().fadeOut('fast', function () {
        $(this).remove();
        saveLocales();
        resize();
      });
    });
    $('.city', $li).editLabel(l);
    $list.append($li);
    l.coolClock = new CoolClock({
      canvasId: canvasId,
      displayRadius: radius,
      skin: skin,
      gmtOffset: l.offset + l.dst,
      showSecondHand: showSecondHand,
      showDigital: false,
    });

    locales[id] = l;
    return $li;
  }


  function changeClockSize (r) {
    if (!parseInt(r)) return;
    radius = r;
    WorldClocks.pref.set('radius', radius);
    updateCoolClock();
    resize();
  }

  function updateCoolClock () {
    $('li', $list).each(function () {
      const id = $(this).attr('id'), cc = locales[id].coolClock;
      cc.setRadius(radius).setSecondHand(showSecondHand);
      // Digital Clock of CoolClock is too small, so show it by own
      //cc.setShowDigital(showDigitalClock);
      cc.refreshDisplay();
      cc.tick();
    });
  }

  function changeDigitalClockFontSize (fontSize) {
    if (!parseInt(fontSize)) return;
    digitalClockFontSize = fontSize;
    WorldClocks.pref.set('digitalClockFontSize', fontSize);
    $list.find('.digital_clock').
      css({ 'font-size': `${digitalClockFontSize}px` });
  }

  function updateDigitalClock () {
    const now = new Date();
    $('li', $list).each(function () {
      const id = $(this).attr('id'), l = locales[id];
      if (!l) return;
      const t = new Date(now.valueOf() +
          ((parseFloat(l.offset) + parseFloat(l.dst)) * 1000 * 60 * 60)),
        lt = toLocalTime(t);
      $(this).
        find('.digital_clock').
        html(toLocaleShortTimeString(lt, false, useDigitalClock24h));
      $(this).find('.date').html(toShortDateString(lt));

    });
  }

})(jQuery);
