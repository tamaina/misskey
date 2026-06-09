<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root">
	<p :class="$style.text"><i class="ti ti-alert-triangle"></i> {{ $locale.env.somethingHappened }}</p>
	<button class="_buttonGray _buttonRounded" :class="$style.button" @click="() => emit('retry')">{{ $locale.env.retry }}</button>
</div>
</template>

<script lang="ts" setup>

const emit = defineEmits<{
	(ev: 'retry'): void;
}>();
</script>

<style lang="scss" module>
.root {
	padding: 32px;
	text-align: center;
  align-items: center;
}

.text {
	margin: 0 0 8px 0;
}

.button {
	margin: 0 auto;
}

.img {
	vertical-align: bottom;
  width: 128px;
	height: 128px;
	margin-bottom: 16px;
	border-radius: 16px;
}
</style>
