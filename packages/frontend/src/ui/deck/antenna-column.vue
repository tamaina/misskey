<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn :menu="menu" :column="column" :isStacked="isStacked" :refresher="async () => { await timeline?.reloadTimeline() }">
	<template #header>
		<i class="ti ti-antenna"></i><span style="margin-left: 8px;">{{ column.name || column.timelineNameCache || $locale.env._deck._columns.antenna }}</span>
	</template>

	<MkStreamingNotesTimeline v-if="column.antennaId" ref="timeline" src="antenna" :antenna="column.antennaId"/>
</XColumn>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { onMounted, ref, useTemplateRef, watch, defineAsyncComponent } from 'vue';
import XColumn from './column.vue';
import type { entities as MisskeyEntities } from 'misskey-js';
import type { Column } from '@/deck.js';
import type { MenuItem } from '@/types/menu.js';
import type { SoundStore } from '@/preferences/def.js';
import { updateColumn } from '@/deck.js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { antennasCache } from '@/cache.js';
import { soundSettingsButton } from '@/ui/deck/tl-note-notification.js';

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const timeline = useTemplateRef('timeline');
const soundSetting = ref<SoundStore>(props.column.soundSetting ?? { type: null, volume: 1 });

onMounted(() => {
	if (props.column.antennaId == null) {
		setAntenna();
	} else if (props.column.timelineNameCache == null) {
		misskeyApi('antennas/show', { antennaId: props.column.antennaId })
			.then(value => updateColumn(props.column.id, { timelineNameCache: value.name }));
	}
});

watch(soundSetting, v => {
	updateColumn(props.column.id, { soundSetting: v });
});

async function setAntenna() {
	const antennas = await misskeyApi('antennas/list');
	const { canceled, result: antennaIdOrOperation } = await os.select({
		title: localeRef.value.env.selectAntenna,
		items: [
			{ value: '_CREATE_', label: localeRef.value.env.createNew },
			(antennas.length > 0 ? {
				type: 'group' as const,
				label: localeRef.value.env.createdAntennas,
				items: antennas.map(x => ({
					value: x.id, label: x.name,
				})),
			} : undefined),
		],
		default: antennas.find(x => x.id === props.column.antennaId)?.id,
	});

	if (canceled || antennaIdOrOperation == null) return;

	if (antennaIdOrOperation === '_CREATE_') {
		const { dispose } = await os.popupAsyncWithDialog(import('@/components/MkAntennaEditorDialog.vue').then(x => x.default), {}, {
			created: (newAntenna: MisskeyEntities.Antenna) => {
				antennasCache.delete();
				updateColumn(props.column.id, {
					antennaId: newAntenna.id,
					timelineNameCache: newAntenna.name,
				});
			},
			closed: () => {
				dispose();
			},
		});
		return;
	}

	const antenna = antennas.find(x => x.id === antennaIdOrOperation)!;

	updateColumn(props.column.id, {
		antennaId: antenna.id,
		timelineNameCache: antenna.name,
	});
}

function editAntenna() {
	os.pageWindow('/my/antennas/' + props.column.antennaId);
}

const menu: MenuItem[] = [
	{
		icon: 'ti ti-pencil',
		text: localeRef.value.env.selectAntenna,
		action: setAntenna,
	},
	{
		icon: 'ti ti-settings',
		text: localeRef.value.env.editAntenna,
		action: editAntenna,
	},
	{
		icon: 'ti ti-bell',
		text: localeRef.value.env._deck.newNoteNotificationSettings,
		action: () => soundSettingsButton(soundSetting),
	},
];

/*
function focus() {
	timeline.focus();
}

defineExpose({
	focus,
});
*/
</script>
