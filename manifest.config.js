import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

// https://developer.chrome.com/docs/extensions/reference/manifest
export default defineManifest({
  name: '__MSG_APP_TITLE__',
  description: '__MSG_APP_DESCRIPTION__',
  version: pkg.version,
  manifest_version: 3,
  default_locale: 'en',
  icons: {
    16: 'icon_16.png',
    32: 'icon_32.png',
    48: 'icon_48.png',
    128: 'icon_128.png',
  },
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  options_ui: {
    page: 'src/options/options.html',
    open_in_tab: false,
  },
  action: {
    default_icon: {
      16: 'icon_16.png',
      32: 'icon_32.png',
      48: 'icon_48.png',
      128: 'icon_128.png',
    },
    default_popup: 'src/popup/popup.html',
  },
  permissions: ['alarms', 'offscreen'],
});
