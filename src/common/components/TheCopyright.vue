<script setup lang="ts">
import WorldClocks from '@/common/scripts/world-clocks';

const version = chrome.runtime.getManifest().version;
const copyright = `${WorldClocks.msg('APP_TITLE')} ${version}`;
</script>

<template>
  <div class="copyright">
    {{ copyright }}
  </div>
</template>

<style scoped lang="scss"></style>
