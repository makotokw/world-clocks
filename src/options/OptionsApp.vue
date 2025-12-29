<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import WorldClocks from '@/common/scripts/world-clocks';

const skins = ref<string[]>(Object.keys(CoolClock.config.skins));
const selectedSkin = ref(WorldClocks.pref.get('ba_skin', 'chunkySwiss'));
const showFooter = ref(WorldClocks.pref.get('showFooter', 'true') !== 'false');

const version = chrome.runtime.getManifest().version;
const copyright = `${WorldClocks.msg('APP_TITLE')} ${version}`;

onMounted(() => {
  document.documentElement.lang = chrome.i18n.getUILanguage();
});

watch(selectedSkin, (newSkin) => {
  try {
    chrome.runtime.sendMessage({
      type: 'setSkin',
      target: 'offscreen',
      skin: newSkin
    }).then(() => { });
  } catch (e) {
    // ignore
  }
  WorldClocks.pref.set('ba_skin', newSkin);
});

watch(showFooter, (newValue) => {
  WorldClocks.pref.set('showFooter', newValue);
});

function t(key: string): string {
  return WorldClocks.msg(key);
}
</script>

<template>
  <div class="container">
    <div class="page-header">
      <header>
        <h1 id="title">{{ t('OPTION_TITLE') }}</h1>
      </header>
    </div>
    <form @submit.prevent>
      <fieldset>
        <legend id="option_group_icon">{{ t('ICON_GROUP') }}</legend>
        <div class="control-group">
          <label class="control-label" for="skin_select">{{ t('SKIN_LABEL') }}</label>
          <div class="controls">
            <select id="skin_select" v-model="selectedSkin">
              <option v-for="skin in skins" :key="skin" :value="skin">
                {{ skin }}
              </option>
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend id="option_group_popup">{{ t('POPUP_GROUP') }}</legend>
        <div class="control-group">
          <div class="controls">
            <label for="show_footer">
              <input id="show_footer" type="checkbox" v-model="showFooter" />
              <span>{{ t('SHOW_FOOTER_LABEL') }}</span>
            </label>
            <p class="help-block">{{ t('SHOW_FOOTER_HELP') }}</p>
          </div>
        </div>
      </fieldset>
    </form>
    <footer class="footer">
      <p id="copyright">{{ copyright }}</p>
    </footer>
  </div>
</template>

<style lang="scss">
@import "./options.scss";
</style>
