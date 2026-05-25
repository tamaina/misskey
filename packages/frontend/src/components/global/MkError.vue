<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkResult type="error">
	<MkButton :class="$style.button" rounded @click="() => emit('retry')">{{ $locale.env.retry }}</MkButton>
</MkResult>
</template>

<script lang="ts" setup>

import MkButton from '@/components/MkButton.vue';

const emit = defineEmits<{
	(ev: 'retry'): void;
}>();
</script>

<style lang="scss" module>
.button {
	margin: 0 auto;
}
</style>
