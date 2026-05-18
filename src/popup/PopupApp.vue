<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import ClockItem from './ClockItem.vue';
import WorldClocks from '@/common/scripts/world-clocks';
import Locale from '@/common/scripts/locale.ts';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import timeZones from '@/common/scripts/time-zones';
import TheCopyright from '@/common/components/TheCopyright.vue';

function t(key: string): string {
  return WorldClocks.msg(key);
}

const radius = ref(WorldClocks.pref.get('radius', 40));
const digitalClockFontSize = ref(WorldClocks.pref.get('digitalClockFontSize', 10));
const skin = ref(WorldClocks.pref.get('skin', 'chunkySwiss'));
const showAnalogClock = ref(WorldClocks.pref.get('showAnalogClock', 'true') !== 'false');
const showSecondHand = ref(WorldClocks.pref.get('showSecondHand', 'true') !== 'false');
const showDigitalClock = ref(WorldClocks.pref.get('showDigitalClock', 'true') !== 'false');
const useDigitalClock24h = ref(WorldClocks.pref.get('useDigitalClock24h', 'true') !== 'false');
const showDate = ref(WorldClocks.pref.get('showDate', 'true') !== 'false');
const showFooter = ref(WorldClocks.pref.get('showFooter', 'true') !== 'false');
const column = ref(WorldClocks.pref.get('column', 4));
const isEditMode = ref(false);
const locales = ref<Locale[]>([]);

onMounted(() => {
  locales.value = WorldClocks.loadLocales();
  document.documentElement.lang = chrome.i18n.getUILanguage();
});

watch(locales, (val) => WorldClocks.saveLocales(val), { deep: true });
watch(radius, (val) => WorldClocks.pref.set('radius', val));
watch(digitalClockFontSize, (val) => WorldClocks.pref.set('digitalClockFontSize', val));
watch(skin, (val) => WorldClocks.pref.set('skin', val));
watch(showAnalogClock, (val) => WorldClocks.pref.set('showAnalogClock', val));
watch(showSecondHand, (val) => WorldClocks.pref.set('showSecondHand', val));
watch(showDigitalClock, (val) => WorldClocks.pref.set('showDigitalClock', val));
watch(useDigitalClock24h, (val) => WorldClocks.pref.set('useDigitalClock24h', val));
watch(showDate, (val) => WorldClocks.pref.set('showDate', val));
watch(column, (val) => WorldClocks.pref.set('column', val));

const listWidth = computed(() => {
  const margin = 5;
  const count = locales.value.length;
  const col = parseInt(column.value as any) || 1;
  const num = count === 0 ? col : Math.min(col, count);
  return num * (margin * 2 + radius.value * 2);
});

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
  <div>
    <draggable
      v-model="locales"
      tag="ul"
      class="clocks"
      item-key="label"
      :disabled="!isEditMode"
      :style="{ width: listWidth + 'px' }"
    >
      <!--suppress VueUnrecognizedSlot -->
      <template #item="{ element, index }">
        <ClockItem
          :locale="element"
          :radius="radius"
          :skin="skin"
          :showAnalogClock="showAnalogClock"
          :showSecondHand="showSecondHand"
          :showDigitalClock="showDigitalClock"
          :useDigitalClock24h="useDigitalClock24h"
          :showDate="showDate"
          :digitalClockFontSize="digitalClockFontSize"
          :editMode="isEditMode"
          :timeZones="timeZones"
          @update:label="element.label = $event"
          @update:offset="element.offset = $event"
          @update:dst="element.dst = $event"
          @remove="removeClock(index)"
        />
      </template>
    </draggable>

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
            <button class="btn add-button" @click.prevent="addClock" :title="t('ADD_HELP')">
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
              <label class="control-label">{{ t('FONT_SIZE_LABEL') }}</label>
              <div class="controls">
                <input
                  v-model.number="digitalClockFontSize"
                  type="number"
                  min="10"
                  max="40"
                  step="1"
                  required
                />
              </div>
            </div>
            <div class="control-group">
              <label class="control-label">{{ t('DETAIL_LABEL') }}</label>
              <div class="controls">
                <label class="checkbox-label">
                  <input v-model="showDigitalClock" type="checkbox" />
                  {{ t('SHOW_DIGITAL_CLOCK_LABEL') }}
                </label>
                <label class="checkbox-label">
                  <input v-model="useDigitalClock24h" type="checkbox" />
                  {{ t('DIGITAL_CLOCK_24H') }}
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
  max-height: 500px;
}
</style>
