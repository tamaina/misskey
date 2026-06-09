<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkSelect v-model="statusbar.type" :items="statusbarTypeDef">
		<template #label>{{ $locale.env.type }}</template>
	</MkSelect>

	<MkInput v-model="statusbar.name" manualSave>
		<template #label>{{ $locale.env.label }}</template>
	</MkInput>

	<MkSwitch v-model="statusbar.black">
		<template #label>Black</template>
	</MkSwitch>

	<MkRadios
		v-model="statusbar.size"
		:options="[
			{ value: 'verySmall', label: $locale.env.small + '+' },
			{ value: 'small', label: $locale.env.small },
			{ value: 'medium', label: $locale.env.medium },
			{ value: 'large', label: $locale.env.large },
			{ value: 'veryLarge', label: $locale.env.large + '+' },
		]"
	>
		<template #label>{{ $locale.env.size }}</template>
	</MkRadios>

	<template v-if="statusbar.type === 'rss'">
		<MkInput v-model="statusbar.props.url" manualSave type="url">
			<template #label>URL</template>
		</MkInput>
		<MkSwitch v-model="statusbar.props.shuffle">
			<template #label>{{ $locale.env.shuffle }}</template>
		</MkSwitch>
		<MkInput v-model="statusbar.props.refreshIntervalSec" manualSave type="number" :min="1">
			<template #label>{{ $locale.env.refreshInterval }}</template>
		</MkInput>
		<MkRange v-model="statusbar.props.marqueeDuration" :min="5" :max="150" :step="1">
			<template #label>{{ $locale.env.speed }}</template>
			<template #caption>{{ $locale.env.fast }} &lt;-&gt; {{ $locale.env.slow }}</template>
		</MkRange>
		<MkSwitch v-model="statusbar.props.marqueeReverse">
			<template #label>{{ $locale.env.reverse }}</template>
		</MkSwitch>
	</template>
	<template v-else-if="statusbar.type === 'federation'">
		<MkInput v-model="statusbar.props.refreshIntervalSec" manualSave type="number" :min="1">
			<template #label>{{ $locale.env.refreshInterval }}</template>
		</MkInput>
		<MkRange v-model="statusbar.props.marqueeDuration" :min="5" :max="150" :step="1">
			<template #label>{{ $locale.env.speed }}</template>
			<template #caption>{{ $locale.env.fast }} &lt;-&gt; {{ $locale.env.slow }}</template>
		</MkRange>
		<MkSwitch v-model="statusbar.props.marqueeReverse">
			<template #label>{{ $locale.env.reverse }}</template>
		</MkSwitch>
		<MkSwitch v-model="statusbar.props.colored">
			<template #label>{{ $locale.env.colored }}</template>
		</MkSwitch>
	</template>
	<template v-else-if="statusbar.type === 'userList' && userLists != null">
		<MkSelect v-model="statusbar.props.userListId" :items="userListsDef">
			<template #label>{{ $locale.env.userList }}</template>
		</MkSelect>
		<MkInput v-model="statusbar.props.refreshIntervalSec" manualSave type="number">
			<template #label>{{ $locale.env.refreshInterval }}</template>
		</MkInput>
		<MkRange v-model="statusbar.props.marqueeDuration" :min="5" :max="150" :step="1">
			<template #label>{{ $locale.env.speed }}</template>
			<template #caption>{{ $locale.env.fast }} &lt;-&gt; {{ $locale.env.slow }}</template>
		</MkRange>
		<MkSwitch v-model="statusbar.props.marqueeReverse">
			<template #label>{{ $locale.env.reverse }}</template>
		</MkSwitch>
	</template>

	<div class="_buttons">
		<MkButton danger @click="del">{{ $locale.env.remove }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { reactive, computed, watch } from 'vue';
import * as Misskey from 'misskey-js';
import type { MkSelectItem } from '@/components/MkSelect.vue';
import type { StatusbarStore } from '@/preferences/def.js';
import MkSelect from '@/components/MkSelect.vue';
import MkInput from '@/components/MkInput.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkRadios from '@/components/MkRadios.vue';
import MkButton from '@/components/MkButton.vue';
import MkRange from '@/components/MkRange.vue';
import { instance } from '@/instance.js';
import { deepClone } from '@/utility/clone.js';
import { prefer } from '@/preferences.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	_id: string;
	userLists: Misskey.entities.UserList[] | null;
}>();

const statusbar = reactive<StatusbarStore>(deepClone(prefer.s.statusbars.find(x => x.id === props._id)!));

const statusbarTypeDef = computed(() => {
	const items = [
		{ label: 'RSS', value: 'rss' },
	] satisfies MkSelectItem[];
	if (instance.federation !== 'none') {
		items.push({ label: 'Federation', value: 'federation' });
	}
	if (props.userLists != null) {
		items.push({ label: localeRef.value.env.userList, value: 'userList' });
	}
	return items;
});

const userListsDef = computed(() => {
	return (props.userLists ?? []).map(x => ({ label: x.name, value: x.id })) satisfies MkSelectItem[];
});

watch(() => statusbar.type, () => {
	if (statusbar.type === 'rss') {
		statusbar.name = 'NEWS';
		statusbar.props.url = 'http://feeds.afpbb.com/rss/afpbb/afpbbnews';
		statusbar.props.shuffle = true;
		statusbar.props.refreshIntervalSec = 120;
		statusbar.props.display = 'marquee';
		statusbar.props.marqueeDuration = 100;
		statusbar.props.marqueeReverse = false;
	} else if (statusbar.type === 'federation') {
		statusbar.name = 'FEDERATION';
		statusbar.props.refreshIntervalSec = 120;
		statusbar.props.display = 'marquee';
		statusbar.props.marqueeDuration = 100;
		statusbar.props.marqueeReverse = false;
		statusbar.props.colored = false;
	} else if (statusbar.type === 'userList') {
		statusbar.name = 'LIST TL';
		statusbar.props.refreshIntervalSec = 120;
		statusbar.props.display = 'marquee';
		statusbar.props.marqueeDuration = 100;
		statusbar.props.marqueeReverse = false;
	}
});

watch(statusbar, save);

async function save() {
	const i = prefer.s.statusbars.findIndex(x => x.id === props._id);
	const statusbars = deepClone(prefer.s.statusbars);
	statusbars[i] = deepClone(statusbar);
	prefer.commit('statusbars', statusbars);
}

function del() {
	prefer.commit('statusbars', prefer.s.statusbars.filter(x => x.id !== props._id));
}
</script>
