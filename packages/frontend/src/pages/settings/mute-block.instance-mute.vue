<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkInfo>{{ $locale.env._instanceMute.title }}</MkInfo>
	<MkTextarea v-model="instanceMutes">
		<template #label>{{ $locale.env._instanceMute.heading }}</template>
		<template #caption>{{ $locale.env._instanceMute.instanceMuteDescription }}<br>{{ $locale.env._instanceMute.instanceMuteDescription2 }}</template>
	</MkTextarea>
	<MkButton primary :disabled="!changed" @click="save()"><i class="ti ti-device-floppy"></i> {{ $locale.env.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkButton from '@/components/MkButton.vue';
import { ensureSignin } from '@/i.js';
import { misskeyApi } from '@/utility/misskey-api.js';

const $i = ensureSignin();

const instanceMutes = ref($i.mutedInstances.join('\n'));
const changed = ref(false);

async function save() {
	let mutes = instanceMutes.value
		.trim().split('\n')
		.map(el => el.trim())
		.filter(el => el);

	await misskeyApi('i/update', {
		mutedInstances: mutes,
	});

	changed.value = false;

	// Refresh filtered list to signal to the user how they've been saved
	instanceMutes.value = mutes.join('\n');
}

watch(instanceMutes, () => {
	changed.value = true;
});
</script>
