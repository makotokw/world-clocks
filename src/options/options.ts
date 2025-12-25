import '@/common/scripts/coolclock';
import '@/common/scripts/coolclock_patch';
import '@/common/scripts/coolclock_moreskins';
import { WorldClocks } from '@/common/scripts/worldclocks';

(function () {
  const w: any = WorldClocks;

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
      el.innerHTML = w.msg(value);
    }
  }

  const titleEl = document.getElementById('title');
  if (titleEl) {
    titleEl.innerHTML = w.msg('OPTION_TITLE');
  }

  const version = chrome.runtime.getManifest().version;
  const copyrightEl = document.getElementById('copyright');
  if (copyrightEl) {
    copyrightEl.innerHTML = w.msg('APP_TITLE') + ' ' + version;
  }

  // skin
  let skin = w.pref.get('ba_skin');
  const skinSelect = document.getElementById('skin_select') as HTMLSelectElement;

  if (skinSelect) {
    for (const attr in (window as any).CoolClock.config.skins) {
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
          skinId: skin
        }).then(() => { });
      } catch (e) {
      }
      w.pref.set('ba_skin', skin);
    });
  }

  // footer
  const showFooter = ('false' !== w.pref.get('showFooter', 'true'));
  const showFooterCheckbox = document.getElementById('show_footer') as HTMLInputElement;
  if (showFooterCheckbox) {
    showFooterCheckbox.checked = showFooter;
    showFooterCheckbox.addEventListener('change', () => {
      const show = showFooterCheckbox.checked;
      w.pref.set('showFooter', show);
    });
  }
})();
