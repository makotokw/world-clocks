import CoolClock from '@/common/scripts/coolclock_moreskins';
import WorldClocks from '@/common/scripts/world-clocks';

(function () {
  document.documentElement.lang = chrome.i18n.getUILanguage();

  // localize
  const messages: Record<string, string> = {
    'option_group_icon': 'ICON_GROUP',
    'option_group_popup': 'POPUP_GROUP',
    'skin_label': 'SKIN_LABEL',
    'show_footer_label_text': 'SHOW_FOOTER_LABEL',
    'show_footer_help': 'SHOW_FOOTER_HELP',
  };

  for (const [key, value] of Object.entries(messages)) {
    const el = document.getElementById(key);
    if (el) {
      el.innerHTML = WorldClocks.msg(value);
    }
  }

  const titleEl = document.getElementById('title');
  if (titleEl) {
    titleEl.innerHTML = WorldClocks.msg('OPTION_TITLE');
  }

  const version = chrome.runtime.getManifest().version;
  const copyrightEl = document.getElementById('copyright');
  if (copyrightEl) {
    copyrightEl.innerHTML = WorldClocks.msg('APP_TITLE') + ' ' + version;
  }

  // skin
  let skin = WorldClocks.pref.get('ba_skin');
  const skinSelect = document.getElementById('skin_select') as HTMLSelectElement;

  if (skinSelect) {
    for (const attr in CoolClock.config.skins) {
      const option = document.createElement('option');
      option.value = attr;
      option.textContent = attr;
      skinSelect.appendChild(option);
    }

    skinSelect.value = skin;
    skinSelect.addEventListener('change', () => {
      skin = skinSelect.value;
      try {
        chrome.runtime.sendMessage({
          type: 'setSkin',
          target: 'offscreen',
          skin
        }).then(() => { });
      } catch (e) {
      }
      WorldClocks.pref.set('ba_skin', skin);
    });
  }

  // footer
  const showFooter = ('false' !== WorldClocks.pref.get('showFooter', 'true'));
  const showFooterCheckbox = document.getElementById('show_footer') as HTMLInputElement;
  if (showFooterCheckbox) {
    showFooterCheckbox.checked = showFooter;
    showFooterCheckbox.addEventListener('change', () => {
      const show = showFooterCheckbox.checked;
      WorldClocks.pref.set('showFooter', show);
    });
  }
})();
