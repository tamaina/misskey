<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="[$style.root, { [$style.oneline]: oneline }]">
	<div :class="$style.key">
		<slot name="key"></slot>
	</div>
	<div :class="$style.value" class="_selectable">
		<slot name="value"></slot>
		<button v-if="copy" v-tooltip="$locale.env.copy" class="_textButton" style="margin-left: 0.5em;" @click="copy_"><i class="ti ti-copy"></i></button>
	</div>
</div>
</template>

<script lang="ts" setup>

import { } from 'vue';
import { copyToClipboard } from '@/utility/copy-to-clipboard.js';
import * as os from '@/os.js';

const props = withDefaults(defineProps<{
	copy?: string | null;
	oneline?: boolean;
}>(), {
	copy: null,
	oneline: false,
});

const copy_ = () => {
	copyToClipboard(props.copy);
};
</script>

<style lang="scss" module>
.root {
	&.oneline {
		display: flex;

		.key {
			width: 30%;
			font-size: 1em;
			padding: 0 8px 0 0;
		}

		.value {
			width: 70%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}
}

.key {
	font-size: 0.85em;
	padding: 0 0 0.25em 0;
	opacity: 0.75;
}
</style>
