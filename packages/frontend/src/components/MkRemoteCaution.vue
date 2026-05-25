<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div :class="$style.root"><i class="ti ti-alert-triangle" style="margin-right: 8px;"></i>{{ $locale.env.remoteUserCaution }}<a v-if="href" :class="$style.link" :href="href" rel="nofollow noopener" target="_blank">{{ $locale.env.showOnRemote }}</a></div>
</template>

<script lang="ts" setup>


defineProps<{
	href?: string;
}>();
</script>

<style lang="scss" module>
.root {
	font-size: 0.8em;
	padding: 16px;
	background: var(--MI_THEME-infoWarnBg);
	color: var(--MI_THEME-infoWarnFg);
	border-radius: var(--MI-radius);
	overflow: clip;
}

.link {
	margin-left: 4px;
	color: var(--MI_THEME-accent);
}
</style>
