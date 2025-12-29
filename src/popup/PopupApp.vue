<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import draggable from 'vuedraggable';
import ClockItem from './ClockItem.vue';
import WorldClocks from '@/common/scripts/world-clocks';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import timeZones from '@/common/scripts/time-zones';

const version = chrome.runtime.getManifest().version;
const appTitle = WorldClocks.msg('APP_TITLE');

interface Locale {
  label: string;
  offset: number | string;
  dst: number;
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

const isOptionOpen = ref(false);

const localeTime = new Date();
const localeOffset = (localeTime.getTimezoneOffset() / (-60.0));
const defaultLocales: Locale[] = [
  { label: WorldClocks.msg('LOCAL_TIME'), offset: localeOffset, dst: 0 },
  { label: WorldClocks.msg('LONDON'), offset: '0', dst: 0 },
  { label: WorldClocks.msg('SANJOSE'), offset: '-8', dst: 0 },
  { label: WorldClocks.msg('TOKYO'), offset: '9', dst: 0 },
];

const locales = ref<Locale[]>([]);

onMounted(() => {
  let storedLocales = WorldClocks.pref.get('locales');
  if (storedLocales) {
    try {
      locales.value = JSON.parse(storedLocales);
    } catch (e) {
      locales.value = defaultLocales;
    }
  } else {
    locales.value = defaultLocales;
  }
  document.documentElement.lang = chrome.i18n.getUILanguage();
});

const saveLocales = () => {
  WorldClocks.pref.set('locales', JSON.stringify(locales.value));
};

watch(locales, saveLocales, { deep: true });

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
  const count = locales.value.length;
  const col = parseInt(column.value as any) || 1;
  const num = (count === 0) ? col : Math.min(col, count);
  return num * (5 * 2 + radius.value * 2);
});

const toggleOptions = () => {
  isOptionOpen.value = !isOptionOpen.value;
};

const addClock = () => {
  locales.value.push({
    label: WorldClocks.msg('LOCAL_TIME'),
    offset: localeOffset,
    dst: 0
  });
};

const removeClock = (index: number) => {
  locales.value.splice(index, 1);
};

const availableSkins = Object.keys((CoolClock as any).config.skins);
</script>

<template>
  <div>
    <draggable
      v-model="locales"
      tag="ul"
      id="clocks"
      item-key="label"
      :disabled="!isOptionOpen"
      :class="{ edit_mode: isOptionOpen }"
      :style="{ width: listWidth + 'px' }"
    >
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
          :editMode="isOptionOpen"
          :timeZones="timeZones"
          @update:label="element.label = $event"
          @update:offset="element.offset = $event"
          @update:dst="element.dst = $event"
          @remove="removeClock(index)"
        />
      </template>
    </draggable>

    <div v-if="showFooter" id="footer">
      <div id="option_header" class="well">
        <span id="copyright">{{ appTitle }} {{ version }}</span>
        <a id="option_label" href="#" @click.prevent="toggleOptions">
          {{ isOptionOpen ? WorldClocks.msg('POPUP_OPTION_CLOSE') : WorldClocks.msg('POPUP_OPTION_OPEN') }}
        </a>
      </div>

      <transition name="blind">
        <div v-if="isOptionOpen" id="option_content" class="option_content well" style="display: block;">
          <div>
            <a id="add" class="btn" href="#" @click.prevent="addClock" :title="WorldClocks.msg('ADD_HELP')">
              {{ WorldClocks.msg('ADD_HELP') }}
            </a>
          </div>

          <div class="control_group">
            <label>{{ WorldClocks.msg('COLUMN_LABEL') }}</label>
            <div class="controls">
              <input v-model.number="column" type="number" min="1" max="10" required />
            </div>
          </div>

          <div class="control_group">
            <label>{{ WorldClocks.msg('SIZE_LABEL') }}</label>
            <div class="controls">
              <input v-model.number="radius" type="number" min="20" max="100" step="5" required />
            </div>
          </div>

          <fieldset>
            <legend>{{ WorldClocks.msg('ANALOG_SECTION') }}</legend>
            <div class="control_group">
              <label>{{ WorldClocks.msg('SKIN_LABEL') }}</label>
              <div class="controls">
                <select v-model="skin">
                  <option v-for="s in availableSkins" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>
            <div class="control_group">
              <label>{{ WorldClocks.msg('DETAIL_LABEL') }}</label>
              <div class="controls">
                <input id="show_analog_clock" v-model="showAnalogClock" type="checkbox" />
                <label for="show_analog_clock">{{ WorldClocks.msg('SHOW_ANALOG_CLOCK_LABEL') }}</label><br/>
                <input id="show_second_hand" v-model="showSecondHand" type="checkbox" />
                <label for="show_second_hand">{{ WorldClocks.msg('SHOW_SECOND_HAND_LABEL') }}</label><br/>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>{{ WorldClocks.msg('DIGITAL_SECTION') }}</legend>
            <div class="control_group">
              <label>{{ WorldClocks.msg('FONT_SIZE_LABEL') }}</label>
              <div class="controls">
                <input v-model.number="digitalClockFontSize" type="number" min="10" max="40" step="1" required />
              </div>
            </div>
            <div class="control_group">
              <label>{{ WorldClocks.msg('DETAIL_LABEL') }}</label>
              <div class="controls">
                <input id="show_digital_clock" v-model="showDigitalClock" type="checkbox" />
                <label for="show_digital_clock">{{ WorldClocks.msg('SHOW_DIGITAL_CLOCK_LABEL') }}</label><br/>
                <input id="digital_clock_24h" v-model="useDigitalClock24h" type="checkbox" />
                <label for="digital_clock_24h">{{ WorldClocks.msg('DIGITAL_CLOCK_24H') }}</label><br/>
                <input id="show_date" v-model="showDate" type="checkbox" />
                <label for="show_date">{{ WorldClocks.msg('SHOW_DATE_LABEL') }}</label><br/>
              </div>
            </div>
          </fieldset>
        </div>
      </transition>
    </div>
  </div>
</template>

<style lang="scss">
/* Vue transition for blind effect */
.blind-enter-active, .blind-leave-active {
  transition: max-height 0.3s ease-in-out;
  overflow: hidden;
}
.blind-enter-from, .blind-leave-to {
  max-height: 0;
}
.blind-enter-to, .blind-leave-from {
  max-height: 500px;
}
</style>
