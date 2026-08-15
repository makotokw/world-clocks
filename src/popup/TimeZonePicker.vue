<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch, type CSSProperties } from 'vue';
import WorldClocks from '@/common/scripts/world-clocks';
import {
  formatTimeZoneLabel,
  searchTimeZones,
  supportedTimeZones,
  timeZoneCityName,
  timeZones,
  type TimeZoneEntry,
} from '@/common/scripts/time-zones';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', zoneId: string): void;
}>();

const inputId = `timezone_${Math.random().toString(36).substring(2)}`;
const supportedEntries = supportedTimeZones();
const inputRef = ref<HTMLInputElement | null>(null);
const inputValue = ref('');
const searchQuery = ref('');
const isOpen = ref(false);
const isComposing = ref(false);
const activeIndex = ref(0);
const listStyle = ref<CSSProperties>({});
let blurTimer: ReturnType<typeof setTimeout> | null = null;

const overlayMargin = 8;
const preferredListWidth = 280;

const selectedEntry = computed(() => timeZones.find((entry) => entry.id === props.modelValue));
const selectedLabel = computed(() =>
  selectedEntry.value ? formatTimeZoneLabel(selectedEntry.value) : props.modelValue,
);
const selectedDisplayLabel = computed(() =>
  selectedEntry.value ? timeZoneCityName(selectedEntry.value.id) : props.modelValue,
);
const results = computed(() => searchTimeZones(searchQuery.value, supportedEntries));
const activeOptionId = computed(() =>
  isOpen.value && results.value[activeIndex.value] ? `${inputId}_option_${activeIndex.value}` : '',
);

const syncSelectedLabel = () => {
  inputValue.value = selectedDisplayLabel.value;
  searchQuery.value = '';
};

watch(() => props.modelValue, syncSelectedLabel, { immediate: true });

const updateListPosition = () => {
  const input = inputRef.value;
  if (!input) {
    return;
  }

  const rect = input.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const maxWidth = Math.max(rect.width, viewportWidth - overlayMargin * 2);
  const width = Math.min(Math.max(preferredListWidth, rect.width), maxWidth);
  const left = Math.min(
    Math.max(rect.left, overlayMargin),
    Math.max(overlayMargin, viewportWidth - width - overlayMargin),
  );

  listStyle.value = {
    top: `${rect.bottom + 2}px`,
    left: `${left}px`,
    width: `${width}px`,
  };
};

const openList = () => {
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  isOpen.value = true;
  activeIndex.value = 0;
  nextTick(updateListPosition);
};

const closeList = () => {
  isOpen.value = false;
  activeIndex.value = 0;
};

const onFocus = () => {
  inputValue.value = selectedLabel.value;
  openList();
  searchQuery.value = props.modelValue;
  setTimeout(() => inputRef.value?.select(), 0);
};

const onInput = () => {
  searchQuery.value = inputValue.value;
  openList();
};

const onBlur = () => {
  blurTimer = setTimeout(() => {
    closeList();
    syncSelectedLabel();
  }, 100);
};

const moveActive = (delta: number) => {
  openList();
  if (results.value.length === 0) {
    activeIndex.value = 0;
    return;
  }
  activeIndex.value = (activeIndex.value + delta + results.value.length) % results.value.length;
};

const selectEntry = (entry: TimeZoneEntry) => {
  emit('update:modelValue', entry.id);
  inputValue.value = timeZoneCityName(entry.id);
  searchQuery.value = '';
  closeList();
};

const onEnter = (event: KeyboardEvent) => {
  if (isComposing.value) {
    return;
  }

  const activeEntry = results.value[activeIndex.value];
  if (isOpen.value && activeEntry) {
    event.preventDefault();
    selectEntry(activeEntry);
  }
};

const onEscape = () => {
  closeList();
  syncSelectedLabel();
};

watch(results, () => {
  if (isOpen.value) {
    nextTick(updateListPosition);
  }
});

watch(isOpen, (open) => {
  if (open) {
    window.addEventListener('resize', updateListPosition);
    window.addEventListener('scroll', updateListPosition, true);
    nextTick(updateListPosition);
  } else {
    window.removeEventListener('resize', updateListPosition);
    window.removeEventListener('scroll', updateListPosition, true);
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', updateListPosition);
  window.removeEventListener('scroll', updateListPosition, true);
});
</script>

<template>
  <div class="time-zone-picker">
    <input
      :id="inputId"
      ref="inputRef"
      v-model="inputValue"
      type="text"
      class="time-zone-input"
      role="combobox"
      autocomplete="off"
      :aria-label="WorldClocks.msg('TIME_ZONE_LABEL')"
      :aria-expanded="isOpen"
      :aria-controls="`${inputId}_listbox`"
      :aria-activedescendant="activeOptionId"
      :placeholder="WorldClocks.msg('TIME_ZONE_SEARCH_PLACEHOLDER')"
      :title="selectedLabel"
      @focus="onFocus"
      @input="onInput"
      @blur="onBlur"
      @keydown.down.prevent="moveActive(1)"
      @keydown.up.prevent="moveActive(-1)"
      @keydown.enter="onEnter"
      @keydown.esc.prevent="onEscape"
      @compositionstart="isComposing = true"
      @compositionend="isComposing = false"
    />

    <ul
      v-if="isOpen && results.length > 0"
      :id="`${inputId}_listbox`"
      class="time-zone-list"
      role="listbox"
      :style="listStyle"
    >
      <li
        v-for="(entry, index) in results"
        :id="`${inputId}_option_${index}`"
        :key="entry.id"
        class="time-zone-option"
        :class="{ active: index === activeIndex }"
        role="option"
        :aria-selected="entry.id === modelValue"
        @mousedown.prevent="selectEntry(entry)"
        @mouseenter="activeIndex = index"
      >
        {{ formatTimeZoneLabel(entry) }}
      </li>
    </ul>

    <div v-else-if="isOpen" class="time-zone-empty" :style="listStyle">
      {{ WorldClocks.msg('TIME_ZONE_NO_RESULTS') }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/common/styles/variables' as *;
@use '@/common/styles/mixins' as *;

.time-zone-picker {
  position: relative;
  width: 100%;
}

input[type='text'].time-zone-input {
  box-sizing: border-box;
  width: 100%;
  font-size: 11px;
  text-overflow: ellipsis;
}

.time-zone-list,
.time-zone-empty {
  position: fixed;
  z-index: 20;
  box-sizing: border-box;
  max-height: 145px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  background: $color-bg-white;
  border: 1px solid $color-border;
  @include border-radius(3px);
  @include box-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
}

.time-zone-option,
.time-zone-empty {
  display: block;
  min-height: 18px;
  padding: 3px 5px;
  font-size: 11px;
  line-height: 1.25;
  text-align: left;
}

.time-zone-option {
  cursor: pointer;

  &.active {
    color: #ffffff;
    background: $color-primary;
  }
}

.time-zone-empty {
  color: $color-text-muted;
}
</style>
