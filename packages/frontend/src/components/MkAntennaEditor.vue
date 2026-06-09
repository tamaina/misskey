<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_spacer" style="--MI_SPACER-w: 700px;">
	<div>
		<div class="_gaps_m">
			<MkInput v-model="name">
				<template #label>{{ $locale.env.name }}</template>
			</MkInput>
			<MkSelect v-model="src" :items="antennaSourcesSelectDef">
				<template #label>{{ $locale.env.antennaSource }}</template>
			</MkSelect>
			<MkSelect v-if="src === 'list'" v-model="userListId" :items="userListsSelectDef">
				<template #label>{{ $locale.env.userList }}</template>
			</MkSelect>
			<MkTextarea v-else-if="src === 'users' || src === 'users_blacklist'" v-model="users">
				<template #label>{{ $locale.env.users }}</template>
				<template #caption>{{ $locale.env.antennaUsersDescription }} <button class="_textButton" @click="addUser">{{ $locale.env.addUser }}</button></template>
			</MkTextarea>
			<MkSwitch v-model="excludeBots">{{ $locale.env.antennaExcludeBots }}</MkSwitch>
			<MkSwitch v-model="withReplies">{{ $locale.env.withReplies }}</MkSwitch>
			<MkTextarea v-model="keywords">
				<template #label>{{ $locale.env.antennaKeywords }}</template>
				<template #caption>{{ $locale.env.antennaKeywordsDescription }}</template>
			</MkTextarea>
			<MkTextarea v-model="excludeKeywords">
				<template #label>{{ $locale.env.antennaExcludeKeywords }}</template>
				<template #caption>{{ $locale.env.antennaKeywordsDescription }}</template>
			</MkTextarea>
			<MkSwitch v-model="localOnly">{{ $locale.env.localOnly }}</MkSwitch>
			<MkSwitch v-model="caseSensitive">{{ $locale.env.caseSensitive }}</MkSwitch>
			<MkSwitch v-model="withFile">{{ $locale.env.withFileAntenna }}</MkSwitch>
			<MkSwitch v-model="excludeNotesInSensitiveChannel">{{ $locale.env.excludeNotesInSensitiveChannel }}</MkSwitch>
		</div>
		<div :class="$style.actions">
			<div class="_buttons">
				<MkButton inline primary @click="saveAntenna()"><i class="ti ti-device-floppy"></i> {{ $locale.env.save }}</MkButton>
				<MkButton v-if="initialAntenna.id != null" inline danger @click="deleteAntenna()"><i class="ti ti-trash"></i> {{ $locale.env.delete }}</MkButton>
			</div>
		</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

import { watch, ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import type { DeepPartial } from '@/utility/merge.js';
import MkButton from '@/components/MkButton.vue';
import MkInput from '@/components/MkInput.vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { deepMerge } from '@/utility/merge.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);

type PartialAllowedAntenna = Omit<Misskey.entities.Antenna, 'id' | 'createdAt' | 'updatedAt'> & {
	id?: string;
	createdAt?: string;
	updatedAt?: string;
};

const props = defineProps<{
	antenna?: DeepPartial<PartialAllowedAntenna>;
}>();

const initialAntenna = deepMerge<PartialAllowedAntenna>(props.antenna ?? {}, {
	name: '',
	src: 'all',
	userListId: null,
	users: [],
	keywords: [],
	excludeKeywords: [],
	excludeBots: false,
	withReplies: false,
	caseSensitive: false,
	localOnly: false,
	withFile: false,
	excludeNotesInSensitiveChannel: false,
	isActive: true,
	hasUnreadNote: false,
	notify: false,
});

const emit = defineEmits<{
	(ev: 'created', newAntenna: Misskey.entities.Antenna): void,
	(ev: 'updated', editedAntenna: Misskey.entities.Antenna): void,
	(ev: 'deleted'): void,
}>();

const {
	model: src,
	def: antennaSourcesSelectDef,
} = useMkSelect({
	items: [
		{ value: 'all', label: localeRef.value.env._antennaSources.all },
		//{ value: 'home', label: localeRef.value.env._antennaSources.homeTimeline },
		{ value: 'users', label: localeRef.value.env._antennaSources.users },
		//{ value: 'list', label: localeRef.value.env._antennaSources.userList },
		{ value: 'users_blacklist', label: localeRef.value.env._antennaSources.userBlacklist },
	],
	initialValue: initialAntenna.src,
});

const {
	model: userListId,
	def: userListsSelectDef,
} = useMkSelect({
	items: computed(() => {
		if (userLists.value == null) return [];
		return userLists.value.map(list => ({
			value: list.id,
			label: list.name,
		}));
	}),
	initialValue: initialAntenna.userListId,
});

const name = ref<string>(initialAntenna.name);
const users = ref<string>(initialAntenna.users.join('\n'));
const keywords = ref<string>(initialAntenna.keywords.map(x => x.join(' ')).join('\n'));
const excludeKeywords = ref<string>(initialAntenna.excludeKeywords.map(x => x.join(' ')).join('\n'));
const caseSensitive = ref<boolean>(initialAntenna.caseSensitive);
const localOnly = ref<boolean>(initialAntenna.localOnly);
const excludeBots = ref<boolean>(initialAntenna.excludeBots);
const withReplies = ref<boolean>(initialAntenna.withReplies);
const withFile = ref<boolean>(initialAntenna.withFile);
const excludeNotesInSensitiveChannel = ref<boolean>(initialAntenna.excludeNotesInSensitiveChannel);
const userLists = ref<Misskey.entities.UserList[] | null>(null);

watch(() => src.value, async () => {
	if (src.value === 'list' && userLists.value === null) {
		userLists.value = await misskeyApi('users/lists/list');
	}
});

async function saveAntenna() {
	const antennaData = {
		name: name.value,
		src: src.value,
		userListId: userListId.value,
		excludeBots: excludeBots.value,
		withReplies: withReplies.value,
		withFile: withFile.value,
		excludeNotesInSensitiveChannel: excludeNotesInSensitiveChannel.value,
		caseSensitive: caseSensitive.value,
		localOnly: localOnly.value,
		users: users.value.trim().split('\n').map(x => x.trim()),
		keywords: keywords.value.trim().split('\n').map(x => x.trim().split(' ')),
		excludeKeywords: excludeKeywords.value.trim().split('\n').map(x => x.trim().split(' ')),
	};

	if (initialAntenna.id == null) {
		const res = await os.apiWithDialog('antennas/create', antennaData);
		emit('created', res);
	} else {
		const res = await os.apiWithDialog('antennas/update', { ...antennaData, antennaId: initialAntenna.id });
		emit('updated', res);
	}
}

async function deleteAntenna() {
	if (initialAntenna.id == null) return;

	const { canceled } = await os.confirm({
		type: 'warning',
		text: localizerRef.value.env.removeAreYouSure({ x: initialAntenna.name }),
	});
	if (canceled) return;

	await misskeyApi('antennas/delete', {
		antennaId: initialAntenna.id,
	});

	os.success();
	emit('deleted');
}

function addUser() {
	os.selectUser({ includeSelf: true }).then(user => {
		users.value = users.value.trim();
		users.value += '\n@' + Misskey.acct.toString(user);
		users.value = users.value.trim();
	});
}
</script>

<style lang="scss" module>
.actions {
	margin-top: 16px;
	padding: 24px 0;
	border-top: solid 0.5px var(--MI_THEME-divider);
}
</style>
