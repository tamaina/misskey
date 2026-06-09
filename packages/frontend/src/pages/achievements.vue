<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 1200px;">
		<MkAchievements :user="$i"/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { onActivated, onDeactivated, onMounted, onUnmounted } from 'vue';
import MkAchievements from '@/components/MkAchievements.vue';
import { definePage } from '@/page.js';
import { ensureSignin } from '@/i.js';
import { claimAchievement } from '@/utility/achievements.js';
const localeRef = useLocale(import.meta.url);

const $i = ensureSignin();

let timer: number | null;

function viewAchievements3min() {
	claimAchievement('viewAchievements3min');
}

onMounted(() => {
	if (timer == null) timer = window.setTimeout(viewAchievements3min, 1000 * 60 * 3);
});

onUnmounted(() => {
	if (timer != null) {
		window.clearTimeout(timer);
		timer = null;
	}
});

onActivated(() => {
	if (timer == null) timer = window.setTimeout(viewAchievements3min, 1000 * 60 * 3);
});

onDeactivated(() => {
	if (timer != null) {
		window.clearTimeout(timer);
		timer = null;
	}
});

definePage(() => ({
	title: localeRef.value.env.achievements,
	icon: 'ti ti-medal',
}));
</script>

<style lang="scss" module>

</style>
