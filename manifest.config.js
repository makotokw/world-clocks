import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json';

export default defineManifest({
  name: '__MSG_APP_TITLE__',
  description: '__MSG_APP_DESCRIPTION__',
  version: pkg.version,
  manifest_version: 3,
  default_locale: 'en',
  permissions: [
    'alarms',
    'offscreen'
  ],
  background: {
    service_worker: 'src/service-worker.ts',
    type: 'module',
  },
  options_ui: {
    page: 'src/options.html',
    open_in_tab: false,
  },
  action: {
    default_icon: {
      '16': 'public/icon_16.png',
      '128': 'public/icon_128.png',
    },
    default_popup: 'src/popup.html',
  },
  icons: {
    '16': 'public/icon_16.png',
    '128': 'public/icon_128.png',
  },
  web_accessible_resources: [
    {
      resources: ['src/background.html'],
      matches: ['<all_urls>']
    }
  ]
});
