<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkFolder v-for="x in statusbars" :key="x.id">
		<template #label>{{ x.type ?? $locale.env.notSet }}</template>
		<template #suffix>{{ x.name }}</template>
		<XStatusbar :_id="x.id" :userLists="userLists"/>
	</MkFolder>
	<MkButton primary @click="add">{{ $locale.env.add }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { onMounted, ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import XStatusbar from './statusbar.statusbar.vue';
import { genId } from '@/utility/id.js';
import MkFolder from '@/components/MkFolder.vue';
import MkButton from '@/components/MkButton.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { prefer } from '@/preferences.js';
const localeRef = useLocale(import.meta.url);

const statusbars = prefer.r.statusbars;

const userLists = ref<Misskey.entities.UserList[] | null>(null);

onMounted(() => {
	misskeyApi('users/lists/list').then(res => {
		userLists.value = res;
	});
});

async function add() {
	prefer.commit('statusbars', [...statusbars.value, {
		id: genId(),
		name: null,
		type: null,
		black: false,
		size: 'medium',
		props: {},
	}]);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.statusbar,
	icon: 'ti ti-list',
}));
</script>
