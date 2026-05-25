<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer>
	<template #icon><i class="ti ti-chart-line"></i></template>
	<template #header>{{ $locale.env.activity }}</template>
	<template #func="{ buttonStyleClass }">
		<button class="_button" :class="buttonStyleClass" @click="showMenu">
			<i class="ti ti-dots"></i>
		</button>
	</template>

	<div style="padding: 8px;">
		<MkChart :src="chartSrc" :args="{ user, withoutAll: true }" span="day" :limit="limit" :bar="true" :stacked="true" :detailed="false" :aspectRatio="5"/>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import MkContainer from '@/components/MkContainer.vue';
import MkChart from '@/components/MkChart.vue';
import * as os from '@/os.js';

const props = withDefaults(defineProps<{
	user: Misskey.entities.User;
	limit?: number;
}>(), {
	limit: 50,
});

const chartSrc = ref<'per-user-notes' | 'per-user-pv'>('per-user-notes');

function showMenu(ev: PointerEvent) {
	os.popupMenu([{
		text: localeRef.value.env.notes,
		active: chartSrc.value === 'per-user-notes',
		action: () => {
			chartSrc.value = 'per-user-notes';
		},
	}, {
		text: localeRef.value.env.numberOfProfileView,
		active: chartSrc.value === 'per-user-pv',
		action: () => {
			chartSrc.value = 'per-user-pv';
		},
	}, /*, {
		text: localeRef.value.env.following,
		action: () => {
			chartSrc = 'per-user-following';
		}
	}, {
		text: localeRef.value.env.followers,
		action: () => {
			chartSrc = 'per-user-followers';
		}
	}*/], ev.currentTarget ?? ev.target);
}
</script>
