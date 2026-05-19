<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import WorldClocks from '@/common/scripts/world-clocks';
import TheCopyright from '@/common/components/TheCopyright.vue';

const selectedSkin = ref(WorldClocks.pref.get('ba_skin', 'chunkySwiss'));
const showFooter = ref(WorldClocks.pref.get('showFooter', 'true') !== 'false');

const skins = Object.keys(CoolClock.config.skins);

onMounted(() => {
  document.documentElement.lang = chrome.i18n.getUILanguage();
});

watch(selectedSkin, (newValue) => {
  try {
    chrome.runtime
      .sendMessage({
        type: 'setSkin',
        target: 'offscreen',
        skin: newValue,
      })
      .then(() => {});
  } catch {
    // ignore
  }
  WorldClocks.pref.set('ba_skin', newValue);
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
        <h1 class="page-title">{{ t('OPTION_TITLE') }}</h1>
      </header>
    </div>
    <form @submit.prevent>
      <fieldset>
        <legend>{{ t('ICON_GROUP') }}</legend>
        <div class="control-group">
          <label class="control-label" for="skinSelect">
            {{ t('SKIN_LABEL') }}
          </label>
          <div class="controls">
            <select id="skinSelect" v-model="selectedSkin">
              <option v-for="skin in skins" :key="skin" :value="skin">
                {{ skin }}
              </option>
            </select>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>{{ t('POPUP_GROUP') }}</legend>
        <div class="control-group">
          <label class="control-label"></label>
          <div class="controls">
            <label class="checkbox-label">
              <input v-model="showFooter" type="checkbox" />
              <span>{{ t('SHOW_FOOTER_LABEL') }}</span>
            </label>
            <p class="help-block">{{ t('SHOW_FOOTER_HELP') }}</p>
          </div>
        </div>
      </fieldset>
    </form>
    <div class="footer">
      <TheCopyright />
    </div>
  </div>
</template>

<style lang="scss">
@use '@/common/styles/variables' as *;
@use '@/common/styles/mixins' as *;
@use '@/common/styles/common';

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-small;
}

.page-header {
  margin: 0;
  padding-bottom: $spacing-tiny;
  border-bottom: 1px solid $color-border-light;
}

.page-title {
  margin: 0;
  font-weight: bold;
  font-size: 1.5rem;
}

.footer {
  margin-top: $spacing-base;
  padding-top: $spacing-tiny;
  border-top: 1px solid $color-border-light;
  text-align: center;
}
</style>
