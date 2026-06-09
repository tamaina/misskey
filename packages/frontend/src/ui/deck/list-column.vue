<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn :menu="menu" :column="column" :isStacked="isStacked" :refresher="async () => { await timeline?.reloadTimeline() }">
	<template #header>
		<i class="ti ti-list"></i><span style="margin-left: 8px;">{{ column.name || column.timelineNameCache || $locale.env._deck._columns.list }}</span>
	</template>

	<MkStreamingNotesTimeline v-if="column.listId" ref="timeline" src="list" :list="column.listId" :withRenotes="withRenotes"/>
</XColumn>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { watch, useTemplateRef, ref, onMounted } from 'vue';
import XColumn from './column.vue';
import type { entities as MisskeyEntities } from 'misskey-js';
import type { Column } from '@/deck.js';
import type { MenuItem } from '@/types/menu.js';
import type { SoundStore } from '@/preferences/def.js';
import { updateColumn } from '@/deck.js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { userListsCache } from '@/cache.js';
import { soundSettingsButton } from '@/ui/deck/tl-note-notification.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const timeline = useTemplateRef('timeline');
const withRenotes = ref(props.column.withRenotes ?? true);
const soundSetting = ref<SoundStore>(props.column.soundSetting ?? { type: null, volume: 1 });

onMounted(() => {
	if (props.column.listId == null) {
		setList();
	} else if (props.column.timelineNameCache == null) {
		misskeyApi('users/lists/show', { listId: props.column.listId })
			.then(value => updateColumn(props.column.id, { timelineNameCache: value.name }));
	}
});

watch(withRenotes, v => {
	updateColumn(props.column.id, {
		withRenotes: v,
	});
});

watch(soundSetting, v => {
	updateColumn(props.column.id, { soundSetting: v });
});

async function setList() {
	const lists = await misskeyApi('users/lists/list');
	const { canceled, result: listIdOrOperation } = await os.select({
		title: localeRef.value.env.selectList,
		items: [
			{ value: '_CREATE_', label: localeRef.value.env.createNew },
			(lists.length > 0 ? {
				type: 'group' as const,
				label: localeRef.value.env.createdLists,
				items: lists.map(x => ({
					value: x.id, label: x.name,
				})),
			} : undefined),
		],
		default: lists.find(x => x.id === props.column.listId)?.id,
	});
	if (canceled || listIdOrOperation == null) return;

	if (listIdOrOperation === '_CREATE_') {
		const { canceled, result: name } = await os.inputText({
			title: localeRef.value.env.enterListName,
		});
		if (canceled || name == null || name === '') return;

		const res = await os.apiWithDialog('users/lists/create', { name: name });
		userListsCache.delete();

		updateColumn(props.column.id, {
			listId: res.id,
			timelineNameCache: res.name,
		});
	} else {
		const list = lists.find(x => x.id === listIdOrOperation)!;

		updateColumn(props.column.id, {
			listId: list.id,
			timelineNameCache: list.name,
		});
	}
}

function editList() {
	os.pageWindow('/my/lists/' + props.column.listId);
}

const menu: MenuItem[] = [
	{
		icon: 'ti ti-pencil',
		text: localeRef.value.env.selectList,
		action: setList,
	},
	{
		icon: 'ti ti-settings',
		text: localeRef.value.env.editList,
		action: editList,
	},
	{
		type: 'switch',
		text: localeRef.value.env.showRenotes,
		ref: withRenotes,
	},
	{
		icon: 'ti ti-bell',
		text: localeRef.value.env._deck.newNoteNotificationSettings,
		action: () => soundSettingsButton(soundSetting),
	},
];
</script>
