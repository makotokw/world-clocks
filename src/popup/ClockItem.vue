<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import CoolClock from '@/common/scripts/coolclock-more-skins';
import WorldClocks from '@/common/scripts/world-clocks';
import { toLocalTime, toShortDateString, toLocaleShortTimeString } from '@/common/scripts/time-utils';

interface Locale {
  label: string;
  offset: number | string;
  dst: number;
}

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
  (e: 'update:dst', dst: number): void;
  (e: 'remove'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const coolClock = ref<any>(null);
const currentTime = ref(new Date());
const isEditingLabel = ref(false);
const editLabelValue = ref(props.locale.label);
const labelInputRef = ref<HTMLInputElement | null>(null);

let timerId: any = null;

const updateTime = () => {
  currentTime.value = new Date();
};

const getDisplayTime = () => {
  const offset = parseFloat(props.locale.offset as string) + props.locale.dst;
  const t = new Date(currentTime.value.valueOf() + (offset * 1000 * 60 * 60));
  return toLocalTime(t);
};

const digitalTimeStr = ref('');
const dateStr = ref('');

const refreshTimeStrings = () => {
  const lt = getDisplayTime();
  digitalTimeStr.value = toLocaleShortTimeString(lt, false, props.useDigitalClock24h);
  dateStr.value = toShortDateString(lt);
};

onMounted(() => {
  if (canvasRef.value) {
    const canvasId = `clock_${Math.random().toString(36).substr(2, 9)}`;
    canvasRef.value.id = canvasId;
    coolClock.value = new (CoolClock as any)({
      canvasId: canvasId,
      displayRadius: props.radius,
      skin: props.skin,
      gmtOffset: parseFloat(props.locale.offset as string) + props.locale.dst,
      showSecondHand: props.showSecondHand,
      showDigital: false,
    });
  }
  refreshTimeStrings();
  timerId = setInterval(() => {
    updateTime();
    refreshTimeStrings();
  }, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
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
    coolClock.value.setOffset(parseFloat(props.locale.offset as string) + props.locale.dst);
    coolClock.value.refreshDisplay();
  }
  refreshTimeStrings();
});

const startEditLabel = () => {
  if (props.editMode) {
    isEditingLabel.value = true;
    editLabelValue.value = props.locale.label;
    setTimeout(() => {
      if (labelInputRef.value) labelInputRef.value.focus();
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
  const val = (e.target as HTMLInputElement).checked ? 1 : 0;
  emit('update:dst', val);
};

</script>

<template>
  <li class="clock" :style="{ margin: '5px', width: (radius * 2) + 'px' }">
    <span v-if="!isEditingLabel" class="city" @click="startEditLabel">{{ locale.label }}</span>
    <input
      v-else
      ref="labelInputRef"
      v-model="editLabelValue"
      type="text"
      @keydown.enter="submitLabel"
      @keydown.esc="cancelEditLabel"
      @blur="submitLabel"
    />

    <canvas
      ref="canvasRef"
      class="analog_clock"
      v-show="showAnalogClock"
    ></canvas>

    <span
      v-show="showDigitalClock"
      class="digital_clock"
      :style="{ fontSize: digitalClockFontSize + 'px' }"
    >{{ digitalTimeStr }}</span>

    <span
      v-show="showDate"
      class="date"
    >{{ dateStr }}</span>

    <div v-if="editMode" class="timezone">
      <select :value="locale.offset" @change="onTzChange">
        <option v-for="tz in timeZones" :key="tz.value" :value="tz.value">
          {{ tz.label }}
        </option>
      </select>
      <input
        :id="'dst_' + locale.label"
        class="dst"
        type="checkbox"
        :checked="locale.dst === 1"
        @change="onDstChange"
      />
      <label :for="'dst_' + locale.label">{{ WorldClocks.msg('DST_LABEL') }}</label>
    </div>

    <a v-if="editMode" href="#" class="remove btn btn-danger" @click.prevent="$emit('remove')">
      {{ WorldClocks.msg('REMOVE_CLOCK_LABEL') }}
    </a>
  </li>
</template>

<style scoped lang="scss">
.city {
  cursor: pointer;
}
</style>
