import $ from 'jquery';
window.jQuery = window.$ = $;
// Load jQuery UI after jQuery is exposed on window to satisfy its global dependency
await import('jquery-ui-dist/jquery-ui');
import './coolclock';
import './coolclock_patch';
import './coolclock_moreskins';
import { WorldClocks } from './worldclocks';

(function ($) {
  const w: any = WorldClocks;
  const timeZones = [
    { value: '-12', label: '(GMT -12:00) Eniwetok, Kwajalein' },
    { value: '-11', label: '(GMT -11:00) Midway Island, Samoa' },
    { value: '-10', label: '(GMT -10:00) Hawaii' },
    { value: '-9', label: '(GMT -9:00) Alaska' },
    { value: '-8', label: '(GMT -8:00) Pacific Time (US &amp; Canada)' },
    { value: '-7', label: '(GMT -7:00) Mountain Time (US &amp; Canada)' },
    { value: '-6', label: '(GMT -6:00) Central Time (US &amp; Canada), Mexico City' },
    { value: '-5', label: '(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima' },
    { value: '-4.5', label: '(GMT -4:30) Caracas' },
    { value: '-4', label: '(GMT -4:00) Atlantic Time (Canada), La Paz' },
    { value: '-3.5', label: '(GMT -3:30) Newfoundland' },
    { value: '-3', label: '(GMT -3:00) Brazil, Buenos Aires, Georgetown' },
    { value: '-2', label: '(GMT -2:00) Mid-Atlantic' },
    { value: '-1', label: '(GMT -1:00) Azores, Cape Verde Islands' },
    { value: '0', label: '(GMT) Western Europe Time, London, Lisbon, Casablanca' },
    { value: '1', label: '(GMT +1:00) Brussels, Copenhagen, Madrid, Paris' },
    { value: '2', label: '(GMT +2:00) Kaliningrad, South Africa' },
    { value: '3', label: '(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg' },
    { value: '3.5', label: '(GMT +3:30) Tehran' },
    { value: '4', label: '(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi' },
    { value: '4.5', label: '(GMT +4:30) Kabul' },
    { value: '5', label: '(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent' },
    { value: '5.5', label: '(GMT +5:30) Bombay, Calcutta, Madras, New Delhi' },
    { value: '5.75', label: '(GMT +5:45) Kathmandu' },
    { value: '6', label: '(GMT +6:00) Almaty, Dhaka, Colombo' },
    { value: '6.5', label: '(GMT +6:30) Rangoon' },
    { value: '7', label: '(GMT +7:00) Bangkok, Hanoi, Jakarta' },
    { value: '8', label: '(GMT +8:00) Beijing, Perth, Singapore, Hong Kong' },
    { value: '9', label: '(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk' },
    { value: '9.5', label: '(GMT +9:30) Adelaide, Darwin' },
    { value: '10', label: '(GMT +10:00) Eastern Australia, Guam, Vladivostok' },
    { value: '11', label: '(GMT +11:00) Magadan, Solomon Islands, New Caledonia' },
    { value: '12', label: '(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka' },
    { value: '13', label: '(GMT +13:00) Nuku\'alofa' },
  ];
  const $timezone = $('<select/>');
  $.each(timeZones, function (i, t) {
    $timezone.append(`<option value="${t.value}">${t.label}</option>`);
  });

  const version = chrome.runtime.getManifest().version;
  $('#copyright').html(w.msg('APP_TITLE') + ' ' + version);

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
    //'set_title_label':'CHANGE_TITLE_HELP',
    //'order_label':'CHANGE_ORDER_HELP',
  };

  const $head = $('head');
  const $localStyles = $('<link/>').attr({
    rel: 'stylesheet',
    type: 'text/css',
    href: '_locales/' + chrome.i18n.getMessage('APP_LOCALE') + '/locale.css',
  });
  $head.append($localStyles);

  $.each(messages, function (key, value) {
    $('#' + key).html(w.msg(value));
  });

  // noinspection EqualityComparisonWithCoercionJS
  let radius = w.pref.get('radius', 40),
    digitalClockFontSize = w.pref.get('digitalClockFontSize', 10),
    skin = w.pref.get('skin', 'chunkySwiss'),
    showAnalogClock = ('false' != w.pref.get('showAnalogClock', 'true')),
    showSecondHand = ('false' != w.pref.get('showSecondHand', 'true')),
    showDigitalClock = ('false' != w.pref.get('showDigitalClock', 'true')),
    useDigitalClock24h = ('false' != w.pref.get('useDigitalClock24h', 'true')),
    showDate = ('false' != w.pref.get('showDate', 'true')),
    showFooter = ('false' != w.pref.get('showFooter', 'true')),
    column = w.pref.get('column', 4),
    margin = 5
  ;
  const $list = $('#clocks').disableSelection();
  const localeTime = new Date(),
    localeOffset = (localeTime.getTimezoneOffset() / (-60.0));
  const locales = { _length: 0 }, default_locales = [
    { label: w.msg('LOCAL_TIME'), offset: localeOffset, dst: 0 },
    { label: w.msg('LONDON'), offset: '0', dst: 0 },
    { label: w.msg('SANJOSE'), offset: '-8', dst: 0 },
    { label: w.msg('TOKYO'), offset: '9', dst: 0 },
  ];

  if (!showFooter) {
    $('#footer').remove();
  }

  { // optoins

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
            w.pref.set('column', column);
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
          append(`<label for="${cbxid}">${w.msg('DST_LABEL')}</label>`);
        $self.after($tz);
      },
    });

    const $option_label = $('#option_label'),
      $option_content = $('#option_content'),
      $option_button = $('#option_button'),
      option_open_label = w.msg('POPUP_OPTION_OPEN'),
      option_close_label = w.msg('POPUP_OPTION_CLOSE')
    ;
    $option_button.attr({ title: w.msg('EDIT_HELP') });
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
      attr({ title: w.msg('ADD_HELP') }).
      html(w.msg('ADD_HELP')).
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
      w.pref.set('skin', skin);
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
      w.pref.set('showSecondHand', showSecondHand);
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
      console.log('set showAnalogClock', showAnalogClock);
      w.pref.set('showAnalogClock', showAnalogClock);
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
      w.pref.set('showDigitalClock', showDigitalClock);
      updateDigitalClock();
    }).attr({ checked: showDigitalClock });

    // digital clock 24h
    $('#digital_clock_24h').change(function () {
      useDigitalClock24h = $(this).is(':checked');
      w.pref.set('useDigitalClock24h', useDigitalClock24h);
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
      w.pref.set('showDate', showDate);
      updateDigitalClock();
    }).attr({ checked: showDate });
  }

  update();
  resize();
  updateDigitalClock();
  setInterval(updateDigitalClock, 1000);

  function update () {
    let locales = w.pref.get('locales');
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
    w.pref.set('locales', JSON.stringify(al));
  }

  function addClock (locale) {
    const i = locales._length++, l = locale ||
      { label: w.msg('LOCAL_TIME'), offset: localeOffset, dst: 0 };
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
      w.msg('REMOVE_CLOCK_LABEL') + '</a>';

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
      skinId: skin,
      gmtOffset: l.offset + l.dst,
      showSecondHand: showSecondHand,
      showDigital: false,
    });

    locales[id] = l;
    return $li;
  }

  function toLocalTime () {
    return new Date(this.getUTCFullYear(), this.getUTCMonth(),
      this.getUTCDate(), this.getUTCHours(),
      this.getUTCMinutes(), this.getUTCSeconds(), this.getUTCMilliseconds());
  }

  function toShortDateString () {
    return this.toDateString().replace(/\s?[0-9]{4}\s?/, '');
  }

  function toLocaleShortTimeString (showSecond, use24h) {
    const d = this instanceof Date ? this : new Date();
    let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    let prefix = '', suffix = '';
    if (use24h) {
      if (h < 10) h = `0${h}`;
    } else {
      suffix = (h < 12) ? ' AM' : ' PM';
      if (h >= 12) h -= 12;
    }
    if (m < 10) m = `0${m}`;
    if (s < 10) s = `0${s}`;
    const time = (showSecond) ? `${h}:${m}:${s}` : `${h}:${m}`;
    return prefix + time + suffix;
  }

  function changeClockSize (r) {
    if (!parseInt(r)) return;
    radius = r;
    w.pref.set('radius', radius);
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
    w.pref.set('digitalClockFontSize', fontSize);
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
        lt = toLocalTime.apply(t);
      $(this).
        find('.digital_clock').
        html(toLocaleShortTimeString.call(lt, false, useDigitalClock24h));
      $(this).find('.date').html(toShortDateString.apply(lt));

    });
  }

})(jQuery);
