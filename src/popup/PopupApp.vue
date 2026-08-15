<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import ClockItem from './ClockItem.vue';
import WorldClocks from '@/common/scripts/world-clocks';
import IanaLocale from '@/common/scripts/locale/iana-locale';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import {
  DEFAULT_DIGITAL_CLOCK_FONT_BOLD,
  DEFAULT_DIGITAL_CLOCK_FONT_ID,
  digitalClockFonts,
  getDigitalClockFontOption,
} from '@/common/scripts/digital-clock-fonts';
import TheCopyright from '@/common/components/TheCopyright.vue';

function t(key: string): string {
  return WorldClocks.msg(key);
}

const radius = ref(WorldClocks.pref.get('radius', 40));
const digitalClockFontSize = ref(WorldClocks.pref.get('digitalClockFontSize', 10));
const digitalClockFont = ref(
  getDigitalClockFontOption(WorldClocks.pref.get('digitalClockFont', DEFAULT_DIGITAL_CLOCK_FONT_ID))
    .id,
);
const digitalClockFontBold = ref(
  WorldClocks.pref.get('digitalClockFontBold', String(DEFAULT_DIGITAL_CLOCK_FONT_BOLD)) !== 'false',
);
const skin = ref(WorldClocks.pref.get('skin', 'chunkySwiss'));
const showAnalogClock = ref(WorldClocks.pref.get('showAnalogClock', 'true') !== 'false');
const showSecondHand = ref(WorldClocks.pref.get('showSecondHand', 'true') !== 'false');
const showDigitalClock = ref(WorldClocks.pref.get('showDigitalClock', 'true') !== 'false');
const useDigitalClock24h = ref(WorldClocks.pref.get('useDigitalClock24h', 'true') !== 'false');
const showDigitalClockSeconds = ref(
  WorldClocks.pref.get('showDigitalClockSeconds', 'false') === 'true',
);
const showDate = ref(WorldClocks.pref.get('showDate', 'true') !== 'false');
const showFooter = ref(WorldClocks.pref.get('showFooter', 'true') !== 'false');
const column = ref(WorldClocks.pref.get('column', 4));
const isEditMode = ref(false);
const locales = ref<IanaLocale[]>(WorldClocks.loadLocales());

onMounted(() => {
  document.documentElement.lang = chrome.i18n.getUILanguage();
});

watch(locales, (val) => WorldClocks.saveLocales(val), { deep: true });
watch(radius, (val) => WorldClocks.pref.set('radius', val));
watch(digitalClockFontSize, (val) => WorldClocks.pref.set('digitalClockFontSize', val));
watch(digitalClockFont, (val) => WorldClocks.pref.set('digitalClockFont', val));
watch(digitalClockFontBold, (val) => WorldClocks.pref.set('digitalClockFontBold', val));
watch(skin, (val) => WorldClocks.pref.set('skin', val));
watch(showAnalogClock, (val) => WorldClocks.pref.set('showAnalogClock', val));
watch(showSecondHand, (val) => WorldClocks.pref.set('showSecondHand', val));
watch(showDigitalClock, (val) => WorldClocks.pref.set('showDigitalClock', val));
watch(useDigitalClock24h, (val) => WorldClocks.pref.set('useDigitalClock24h', val));
watch(showDigitalClockSeconds, (val) => WorldClocks.pref.set('showDigitalClockSeconds', val));
watch(showDate, (val) => WorldClocks.pref.set('showDate', val));
watch(column, (val) => WorldClocks.pref.set('column', val));

const listWidth = computed(() => {
  const margin = 5;
  const count = locales.value.length;
  const col = parseInt(String(column.value), 10) || 1;
  const num = count === 0 ? col : Math.min(col, count);
  return num * (margin * 2 + radius.value * 2);
});
const listWidthStyle = computed(() => {
  const width = `${listWidth.value}px`;
  return {
    width,
    minWidth: width,
    maxWidth: width,
  };
});
const applyPopupWidth = (width: number) => {
  const cssWidth = `${width}px`;
  const elements = [document.documentElement, document.body, document.getElementById('app')].filter(
    (element): element is HTMLElement => Boolean(element),
  );

  elements.forEach((element) => {
    element.style.width = cssWidth;
    element.style.minWidth = cssWidth;
    element.style.maxWidth = cssWidth;
  });
  document.body.style.overflowX = 'hidden';
};

watch(
  listWidth,
  (width) => {
    applyPopupWidth(width);
    requestAnimationFrame(() => applyPopupWidth(width));
  },
  { immediate: true },
);

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const addClock = () => {
  locales.value.push(WorldClocks.localLocale);
};

const removeClock = (index: number) => {
  locales.value.splice(index, 1);
};

const availableSkins = Object.keys(CoolClock.config.skins);
</script>

<template>
  <div class="popup-page" :style="listWidthStyle">
    <div class="clock-preview" :style="listWidthStyle">
      <draggable
        v-model="locales"
        tag="ul"
        class="clocks"
        item-key="label"
        :disabled="!isEditMode"
        :style="listWidthStyle"
      >
        <!--suppress VueUnrecognizedSlot -->
        <template #item="{ element, index }">
          <ClockItem
            :locale="element"
            :radius="radius"
            :skin="skin"
            :show-analog-clock="showAnalogClock"
            :show-second-hand="showSecondHand"
            :show-digital-clock="showDigitalClock"
            :use-digital-clock24h="useDigitalClock24h"
            :show-digital-clock-seconds="showDigitalClockSeconds"
            :show-date="showDate"
            :digital-clock-font-size="digitalClockFontSize"
            :digital-clock-font="digitalClockFont"
            :digital-clock-font-bold="digitalClockFontBold"
            :edit-mode="isEditMode"
            @update:label="element.label = $event"
            @update:zone-id="element.zoneId = $event"
            @remove="removeClock(index)"
          />
        </template>
      </draggable>
    </div>

    <div v-if="showFooter" class="footer">
      <div class="option-header well">
        <TheCopyright />
        <a class="option-label" href="#" @click.prevent="toggleEditMode">
          {{ t(isEditMode ? 'POPUP_OPTION_CLOSE' : 'POPUP_OPTION_OPEN') }}
        </a>
      </div>

      <transition name="blind">
        <div v-if="isEditMode" class="option-content well">
          <div>
            <button class="btn add-button" :title="t('ADD_HELP')" @click.prevent="addClock">
              {{ t('ADD_HELP') }}
            </button>
          </div>

          <div class="control-group">
            <label class="control-label">{{ t('COLUMN_LABEL') }}</label>
            <div class="controls">
              <input v-model.number="column" type="number" min="1" max="10" required />
            </div>
          </div>

          <div class="control-group">
            <label class="control-label">{{ t('SIZE_LABEL') }}</label>
            <div class="controls">
              <input v-model.number="radius" type="number" min="20" max="100" step="5" required />
            </div>
          </div>

          <fieldset>
            <legend>{{ t('ANALOG_SECTION') }}</legend>
            <div class="control-group">
              <label class="control-label">{{ t('SKIN_LABEL') }}</label>
              <div class="controls">
                <select v-model="skin">
                  <option v-for="s in availableSkins" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>
            <div class="control-group">
              <label class="control-label">{{ t('DETAIL_LABEL') }}</label>
              <div class="controls">
                <label class="checkbox-label">
                  <input v-model="showAnalogClock" type="checkbox" />
                  {{ t('SHOW_ANALOG_CLOCK_LABEL') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="showSecondHand" type="checkbox" />
                  {{ t('SHOW_SECOND_HAND_LABEL') }}
                </label>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>{{ t('DIGITAL_SECTION') }}</legend>
            <div class="control-group">
              <label class="control-label">{{ t('DIGITAL_CLOCK_FONT_SIZE_LABEL') }}</label>
              <div class="controls">
                <input
                  v-model.number="digitalClockFontSize"
                  type="number"
                  min="8"
                  max="40"
                  step="1"
                  required
                />
              </div>
            </div>
            <div class="control-group">
              <label class="control-label">{{ t('DIGITAL_CLOCK_FONT_LABEL') }}</label>
              <div class="controls">
                <select v-model="digitalClockFont">
                  <option
                    v-for="font in digitalClockFonts"
                    :key="font.id"
                    :value="font.id"
                    :style="{ fontFamily: font.fontFamily }"
                  >
                    {{ font.labelKey ? t(font.labelKey) : font.label }}
                  </option>
                </select>
              </div>
            </div>
            <div class="control-group">
              <label class="control-label">{{ t('DETAIL_LABEL') }}</label>
              <div class="controls">
                <label class="checkbox-label">
                  <input v-model="digitalClockFontBold" type="checkbox" />
                  {{ t('DIGITAL_CLOCK_FONT_BOLD_LABEL') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="showDigitalClock" type="checkbox" />
                  {{ t('SHOW_DIGITAL_CLOCK_LABEL') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="useDigitalClock24h" type="checkbox" />
                  {{ t('DIGITAL_CLOCK_24H') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="showDigitalClockSeconds" type="checkbox" />
                  {{ t('SHOW_DIGITAL_CLOCK_SECONDS_LABEL') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="showDate" type="checkbox" />
                  {{ t('SHOW_DATE_LABEL') }}
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/common/styles/variables' as *;
@use '@/common/styles/mixins' as *;
@use '@/common/styles/common';

.clock-preview {
  position: sticky;
  top: 0;
  z-index: 1;
  width: 100%;
  background: $color-bg-white;
  padding-bottom: $spacing-tiny;
}

.clocks {
  list-style: none;
  padding: 0;
  margin: 0;
}

.add-button {
  width: 100%;
  margin-bottom: 10px;
  display: inline-table;
}

/* options */
legend {
  font-size: 12px;
}

.option-header,
.option-content {
  padding: $spacing-tiny;
  a {
    outline: none;
    text-decoration: none;
  }
}

.option-header {
  margin-bottom: $spacing-tiny;
  text-align: center;
}

/* Vue transition for blind effect */
.blind-enter-active,
.blind-leave-active {
  transition: max-height 0.3s ease-in-out;
  overflow: hidden;
}
.blind-enter-from,
.blind-leave-to {
  max-height: 0;
}
.blind-enter-to,
.blind-leave-from {
  max-height: 1200px;
}
</style>
