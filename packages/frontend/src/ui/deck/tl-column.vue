<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn :menu="menu" :column="column" :isStacked="isStacked" :refresher="async () => { await timeline?.reloadTimeline() }">
	<template #header>
		<i v-if="column.tl != null" :class="basicTimelineIconClass(column.tl)"></i>
		<span style="margin-left: 8px;">{{ column.name || (column.tl ? $locale.env._timelines[column.tl] : null) || $locale.env._deck._columns.tl }}</span>
	</template>

	<div v-if="!isAvailableBasicTimeline(column.tl)" :class="$style.disabled">
		<p :class="$style.disabledTitle">
			<i class="ti ti-circle-minus"></i>
			{{ $locale.env._disabledTimeline.title }}
		</p>
		<p :class="$style.disabledDescription">{{ $locale.env._disabledTimeline.description }}</p>
	</div>
	<MkStreamingNotesTimeline
		v-else-if="column.tl"
		ref="timeline"
		:key="column.tl + withRenotes + withReplies + onlyFiles"
		:src="column.tl"
		:withRenotes="withRenotes"
		:withReplies="withReplies"
		:withSensitive="withSensitive"
		:onlyFiles="onlyFiles"
		:sound="true"
		:customSound="soundSetting"
	/>
</XColumn>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { onMounted, watch, ref, useTemplateRef, computed } from 'vue';
import XColumn from './column.vue';
import type { Column } from '@/deck.js';
import type { MenuItem } from '@/types/menu.js';
import type { SoundStore } from '@/preferences/def.js';
import { removeColumn, updateColumn } from '@/deck.js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import * as os from '@/os.js';
import { hasWithReplies, isAvailableBasicTimeline, basicTimelineIconClass } from '@/timelines.js';
import { soundSettingsButton } from '@/ui/deck/tl-note-notification.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const timeline = useTemplateRef('timeline');

const soundSetting = ref<SoundStore>(props.column.soundSetting ?? { type: null, volume: 1 });
const withRenotes = ref(props.column.withRenotes ?? true);
const withReplies = ref(props.column.withReplies ?? false);
const withSensitive = ref(props.column.withSensitive ?? true);
const onlyFiles = ref(props.column.onlyFiles ?? false);

watch(withRenotes, v => {
	updateColumn(props.column.id, {
		withRenotes: v,
	});
});

watch(withReplies, v => {
	updateColumn(props.column.id, {
		withReplies: v,
	});
});

watch(withSensitive, v => {
	updateColumn(props.column.id, {
		withSensitive: v,
	});
});

watch(onlyFiles, v => {
	updateColumn(props.column.id, {
		onlyFiles: v,
	});
});

watch(soundSetting, v => {
	updateColumn(props.column.id, { soundSetting: v });
});

onMounted(() => {
	if (props.column.tl == null) {
		setType();
	}
});

async function setType() {
	const { canceled, result: src } = await os.select({
		title: localeRef.value.env.timeline,
		items: [{
			value: 'home', label: localeRef.value.env._timelines.home,
		}, {
			value: 'local', label: localeRef.value.env._timelines.local,
		}, {
			value: 'social', label: localeRef.value.env._timelines.social,
		}, {
			value: 'global', label: localeRef.value.env._timelines.global,
		}],
		default: props.column.tl,
	});
	if (canceled) {
		if (props.column.tl == null) {
			removeColumn(props.column.id);
		}
		return;
	}
	if (src == null) return;
	updateColumn(props.column.id, {
		tl: src ?? undefined,
	});
}

const menu = computed<MenuItem[]>(() => {
	const menuItems: MenuItem[] = [];

	menuItems.push({
		icon: 'ti ti-pencil',
		text: localeRef.value.env.timeline,
		action: setType,
	}, {
		icon: 'ti ti-bell',
		text: localeRef.value.env._deck.newNoteNotificationSettings,
		action: () => soundSettingsButton(soundSetting),
	}, {
		type: 'switch',
		text: localeRef.value.env.showRenotes,
		ref: withRenotes,
	});

	if (hasWithReplies(props.column.tl)) {
		menuItems.push({
			type: 'switch',
			text: localeRef.value.env.showRepliesToOthersInTimeline,
			ref: withReplies,
			disabled: onlyFiles,
		});
	}

	menuItems.push({
		type: 'switch',
		text: localeRef.value.env.fileAttachedOnly,
		ref: onlyFiles,
		disabled: hasWithReplies(props.column.tl) ? withReplies : false,
	}, {
		type: 'switch',
		text: localeRef.value.env.withSensitive,
		ref: withSensitive,
	});

	return menuItems;
});
</script>

<style lang="scss" module>
.disabled {
	text-align: center;
}

.disabledTitle {
	margin: 16px;
}

.disabledDescription {
	font-size: 90%;
}
</style>
