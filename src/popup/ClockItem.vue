<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import WorldClocks from '@/common/scripts/world-clocks';
import Locale from '@/common/scripts/locale';
import { toLocalTime, toShortDateString, toLocaleShortTimeString } from '@/common/scripts/time-utils';

const props = defineProps<{
  locale: Locale;
  radius: number;
  skin: string;
  showAnalogClock: boolean;
  showSecondHand: boolean;
  showDigitalClock: boolean;
  useDigitalClock24h: boolean;
  showDate: boolean;
  digitalClockFontSize: number;
  editMode: boolean;
  timeZones: { label: string; value: string }[];
}>();

const emit = defineEmits<{
  (e: 'update:label', label: string): void;
  (e: 'update:offset', offset: number): void;
  (e: 'update:dst', dst: boolean): void;
  (e: 'remove'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const coolClock = ref<CoolClock | null>(null);
const digitalTimeStr = ref('');
const dateStr = ref('');
const isEditingLabel = ref(false);
const editLabelValue = ref(props.locale.label);
const labelInputRef = ref<HTMLInputElement | null>(null);

let timerId: any = null;

const getDisplayTime = (date: Date) => {
  const offset = props.locale.offset + (props.locale.dst ? 1 : 0);
  const t = new Date(date.valueOf() + (offset * 1000 * 60 * 60));
  return toLocalTime(t);
};

const updateTime = () => {
  const lt = getDisplayTime(new Date());
  digitalTimeStr.value = toLocaleShortTimeString(lt, false, props.useDigitalClock24h);
  dateStr.value = toShortDateString(lt);
};

onMounted(() => {
  if (canvasRef.value) {
    const canvasId = `clock_${Math.random().toString(36).substring(2)}`;
    canvasRef.value.id = canvasId;
    coolClock.value = new CoolClock({
      canvasId: canvasId,
      displayRadius: props.radius,
      skin: props.skin,
      gmtOffset: props.locale.offset + (props.locale.dst ? 1 : 0),
      showSecondHand: props.showSecondHand,
      showDigital: false,
    });
  }
  updateTime();
  timerId = setInterval(() => {
    updateTime();
  }, 1000);
});

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId);
  }
});

watch(() => props.radius, (newRadius) => {
  if (coolClock.value) {
    coolClock.value.setRadius(newRadius);
    coolClock.value.refreshDisplay();
    coolClock.value.tick();
  }
});

watch(() => props.skin, (newSkin) => {
  if (coolClock.value) {
    coolClock.value.setSkin(newSkin);
    coolClock.value.refreshDisplay();
  }
});

watch(() => props.showSecondHand, (newVal) => {
  if (coolClock.value) {
    coolClock.value.setSecondHand(newVal);
    coolClock.value.refreshDisplay();
    coolClock.value.tick();
  }
});

watch(() => [props.locale.offset, props.locale.dst], () => {
  if (coolClock.value) {
    coolClock.value.setOffset(props.locale.offset + (props.locale.dst ? 1 : 0));
    coolClock.value.refreshDisplay();
  }
  updateTime();
});

const startEditLabel = () => {
  if (props.editMode) {
    isEditingLabel.value = true;
    editLabelValue.value = props.locale.label;
    setTimeout(() => {
      if (labelInputRef.value) {
        labelInputRef.value.focus();
      }
    }, 0);
  }
};

const submitLabel = () => {
  isEditingLabel.value = false;
  emit('update:label', editLabelValue.value);
};

const cancelEditLabel = () => {
  isEditingLabel.value = false;
};

const onTzChange = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value;
  emit('update:offset', parseFloat(val));
};

const onDstChange = (e: Event) => {
  emit('update:dst', !!(e.target as HTMLInputElement).checked);
};
</script>

<template>
  <li class="clock" :class="{ 'is-edit-mode': editMode }" :title="`${locale.label} ${digitalTimeStr}`" :style="{ width: (radius * 2) + 'px' }">
    <span v-if="!isEditingLabel" class="label" @click="startEditLabel">{{ locale.label }}</span>
    <input
      v-else
      ref="labelInputRef"
      v-model="editLabelValue"
      type="text"
      class="label-input"
      @keydown.enter="submitLabel"
      @keydown.esc="cancelEditLabel"
      @blur="submitLabel"
    />

    <canvas ref="canvasRef" class="analog-clock" v-show="showAnalogClock"></canvas>

    <span v-show="showDigitalClock" class="digital-clock" :style="{ fontSize: digitalClockFontSize + 'px' }">{{ digitalTimeStr }}</span>
    <span v-show="showDate" class="date">{{ dateStr }}</span>

    <div v-if="editMode" class="timezone">
      <select :value="locale.offset" @change="onTzChange">
        <option v-for="tz in timeZones" :key="tz.value" :value="tz.value">
          {{ tz.label }}
        </option>
      </select>
      <label class="checkbox-label">
        <input class="dst" type="checkbox" :checked="locale.dst" @change="onDstChange"/>
        {{ WorldClocks.msg('DST_LABEL') }}
      </label>
    </div>

    <button v-if="editMode" class="btn btn-danger remove-button" @click.prevent="$emit('remove')">
      {{ WorldClocks.msg('REMOVE_CLOCK_LABEL') }}
    </button>
  </li>
</template>

<style scoped lang="scss">
@use '@/common/styles/variables' as *;
@use '@/common/styles/mixins' as *;
@use '@/common/styles/common';

$font-family-digital: 'digitalclock';
@font-face {
  font-family: $font-family-digital;
  src: url('@/common/fonts/Days.otf');
}

.clock {
  position: relative;
  display: inline-block;
  margin: $spacing-tiny;

  &.is-edit-mode {
    cursor: grab;
  }

  span {
    display: block;
    text-align: center;
    height: 1.1em;
    line-height: 1.1em;
  }

  select {
    line-height: 1em;
    font-size: 0.7em;
    padding: 0;
    width: 100%;
    margin: 2px;
  }
}

.label,
input[type="text"].label-input {
  overflow: hidden;
  margin-bottom: 2px;
}
.is-edit-mode .label,
input[type="text"].label-input {
  font-size: 1em;
  padding: 3px;
  margin: 0 2px;
  text-align: center;
  width: 100%;
}
.label {
  text-overflow: ellipsis;
  .is-edit-mode & {
    cursor: pointer;
    border: 1px solid $color-border;
    @include border-radius(3px);
  }
}
input[type="text"].label-input {
  border: 0;
  outline: 0;
  box-shadow: none;
  &:focus {
    border: 0;
    outline: 0;
    box-shadow: none;
  }
}

.analog-clock {
  padding-right: 2px;
}

.digital-clock,
.date {
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  font-family: $font-family-digital;
}
.digital-clock {
  font-weight: bold;
  font-size: 10px;
}

.remove-button {
  width: 100%;
}
</style>
