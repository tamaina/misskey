<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="src" :actions="headerActions" :tabs="$i ? headerTabs : headerTabsWhenNotLogin" :swipable="true" :displayMyAvatar="true" :canOmitTitle="true">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<MkTip v-if="isBasicTimeline(src)" :k="`tl.${src}`" style="margin-bottom: var(--MI-margin);">
			{{ $locale.env._timelineDescription[src] }}
		</MkTip>
		<MkPostForm v-if="prefer.r.showFixedPostForm.value" :class="$style.postForm" class="_panel" fixed style="margin-bottom: var(--MI-margin);"/>
		<MkStreamingNotesTimeline
			ref="tlComponent"
			:key="src + withRenotes + withReplies + onlyFiles + withSensitive"
			:class="$style.tl"
			:src="(src.split(':')[0] as (BasicTimelineType | 'list'))"
			:list="src.split(':')[1]"
			:withRenotes="withRenotes"
			:withReplies="withReplies"
			:withSensitive="withSensitive"
			:onlyFiles="onlyFiles"
			:sound="true"
		/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, watch, provide, useTemplateRef, ref, onMounted, onActivated } from 'vue';
import type { Tab } from '@/components/global/MkPageHeader.tabs.vue';
import type { MenuItem } from '@/types/menu.js';
import type { BasicTimelineType } from '@/timelines.js';
import type { PageHeaderItem } from '@/types/page-header.js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import MkPostForm from '@/components/MkPostForm.vue';
import * as os from '@/os.js';
import { store } from '@/store.js';
import { $i } from '@/i.js';
import { definePage } from '@/page.js';
import { antennasCache, userListsCache, favoritedChannelsCache } from '@/cache.js';
import { deviceKind } from '@/utility/device-kind.js';
import { deepMerge } from '@/utility/merge.js';
import { miLocalStorage } from '@/local-storage.js';
import { availableBasicTimelines, hasWithReplies, isAvailableBasicTimeline, isBasicTimeline, basicTimelineIconClass } from '@/timelines.js';
import { prefer } from '@/preferences.js';
const localeRef = useLocale(import.meta.url);

const tlComponent = useTemplateRef('tlComponent');

type TimelinePageSrc = BasicTimelineType | `list:${string}`;

const srcWhenNotSignin = ref<'local' | 'global'>(isAvailableBasicTimeline('local') ? 'local' : 'global');
const src = computed<TimelinePageSrc>({
	get: () => ($i ? store.r.tl.value.src : srcWhenNotSignin.value),
	set: (x) => saveSrc(x),
});
const withRenotes = computed<boolean>({
	get: () => store.r.tl.value.filter.withRenotes,
	set: (x) => saveTlFilter('withRenotes', x),
});

// computed内での無限ループを防ぐためのフラグ
const localSocialTLFilterSwitchStore = ref<'withReplies' | 'onlyFiles' | false>(
	store.r.tl.value.filter.withReplies ? 'withReplies' :
	store.r.tl.value.filter.onlyFiles ? 'onlyFiles' :
	false,
);

const withReplies = computed<boolean>({
	get: () => {
		if (!$i) return false;
		if (['local', 'social'].includes(src.value) && localSocialTLFilterSwitchStore.value === 'onlyFiles') {
			return false;
		} else {
			return store.r.tl.value.filter.withReplies;
		}
	},
	set: (x) => saveTlFilter('withReplies', x),
});
const onlyFiles = computed<boolean>({
	get: () => {
		if (['local', 'social'].includes(src.value) && localSocialTLFilterSwitchStore.value === 'withReplies') {
			return false;
		} else {
			return store.r.tl.value.filter.onlyFiles;
		}
	},
	set: (x) => saveTlFilter('onlyFiles', x),
});

watch([withReplies, onlyFiles], ([withRepliesTo, onlyFilesTo]) => {
	if (withRepliesTo) {
		localSocialTLFilterSwitchStore.value = 'withReplies';
	} else if (onlyFilesTo) {
		localSocialTLFilterSwitchStore.value = 'onlyFiles';
	} else {
		localSocialTLFilterSwitchStore.value = false;
	}
});

const withSensitive = computed<boolean>({
	get: () => store.r.tl.value.filter.withSensitive,
	set: (x) => saveTlFilter('withSensitive', x),
});

const showFixedPostForm = prefer.model('showFixedPostForm');

async function chooseList(ev: PointerEvent): Promise<void> {
	const lists = await userListsCache.fetch();
	const items: (MenuItem | undefined)[] = [
		...lists.map(list => ({
			type: 'link' as const,
			text: list.name,
			to: `/timeline/list/${list.id}`,
		})),
		(lists.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link' as const,
			icon: 'ti ti-plus',
			text: localeRef.value.env.createNew,
			to: '/my/lists',
		},
	];
	os.popupMenu(items.filter(i => i != null), ev.currentTarget ?? ev.target);
}

async function chooseAntenna(ev: PointerEvent): Promise<void> {
	const antennas = await antennasCache.fetch();
	const items: (MenuItem | undefined)[] = [
		...antennas.map(antenna => ({
			type: 'link' as const,
			text: antenna.name,
			indicate: antenna.hasUnreadNote,
			to: `/timeline/antenna/${antenna.id}`,
		})),
		(antennas.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link' as const,
			icon: 'ti ti-plus',
			text: localeRef.value.env.createNew,
			to: '/my/antennas',
		},
	];
	os.popupMenu(items.filter(i => i != null), ev.currentTarget ?? ev.target);
}

async function chooseChannel(ev: PointerEvent): Promise<void> {
	const channels = await favoritedChannelsCache.fetch();
	const items: (MenuItem | undefined)[] = [
		...channels.map(channel => {
			const lastReadedAt = miLocalStorage.getItemAsJson(`channelLastReadedAt:${channel.id}`) ?? null;
			const hasUnreadNote = (lastReadedAt && channel.lastNotedAt) ? Date.parse(channel.lastNotedAt) > lastReadedAt : !!(!lastReadedAt && channel.lastNotedAt);

			return {
				type: 'link' as const,
				text: channel.name,
				indicate: hasUnreadNote,
				to: `/channels/${channel.id}`,
			};
		}),
		(channels.length === 0 ? undefined : { type: 'divider' }),
		{
			type: 'link',
			icon: 'ti ti-plus',
			text: localeRef.value.env.createNew,
			to: '/channels/new',
		},
	];
	os.popupMenu(items.filter(i => i != null), ev.currentTarget ?? ev.target);
}

function saveSrc(newSrc: TimelinePageSrc): void {
	const out = deepMerge({ src: newSrc }, store.s.tl);

	if (newSrc.startsWith('userList:')) {
		const id = newSrc.substring('userList:'.length);
		out.userList = prefer.r.pinnedUserLists.value.find(l => l.id === id) ?? null;
	}

	store.set('tl', out);
	if (['local', 'global'].includes(newSrc)) {
		srcWhenNotSignin.value = newSrc as 'local' | 'global';
	}
}

function saveTlFilter(key: keyof typeof store.s.tl.filter, newValue: boolean) {
	if (key !== 'withReplies' || $i) {
		const out = deepMerge({ filter: { [key]: newValue } }, store.s.tl);
		store.set('tl', out);
	}
}

function switchTlIfNeeded() {
	if (isBasicTimeline(src.value) && !isAvailableBasicTimeline(src.value)) {
		src.value = availableBasicTimelines()[0];
	}
}

onMounted(() => {
	switchTlIfNeeded();
});
onActivated(() => {
	switchTlIfNeeded();
});

const headerActions = computed<PageHeaderItem[]>(() => {
	const items: PageHeaderItem[] = [{
		icon: 'ti ti-dots',
		text: localeRef.value.env.options,
		handler: (ev) => {
			const menuItems: MenuItem[] = [];

			menuItems.push({
				type: 'switch',
				icon: 'ti ti-repeat',
				text: localeRef.value.env.showRenotes,
				ref: withRenotes,
			});

			if (isBasicTimeline(src.value) && hasWithReplies(src.value)) {
				menuItems.push({
					type: 'switch',
					icon: 'ti ti-messages',
					text: localeRef.value.env.showRepliesToOthersInTimeline,
					ref: withReplies,
					disabled: onlyFiles,
				});
			}

			menuItems.push({
				type: 'switch',
				icon: 'ti ti-eye-exclamation',
				text: localeRef.value.env.withSensitive,
				ref: withSensitive,
			}, {
				type: 'switch',
				icon: 'ti ti-photo',
				text: localeRef.value.env.fileAttachedOnly,
				ref: onlyFiles,
				disabled: isBasicTimeline(src.value) && hasWithReplies(src.value) ? withReplies : false,
			}, {
				type: 'divider',
			}, {
				type: 'switch',
				text: localeRef.value.env.showFixedPostForm,
				ref: showFixedPostForm,
			});

			os.popupMenu(menuItems, ev.currentTarget ?? ev.target);
		},
	}];

	if (deviceKind === 'desktop') {
		items.unshift({
			icon: 'ti ti-refresh',
			text: localeRef.value.env.reload,
			handler: () => {
				tlComponent.value?.reloadTimeline();
			},
		});
	}

	return items;
});

const headerTabs = computed(() => [...(prefer.r.pinnedUserLists.value.map(l => ({
	key: 'list:' + l.id,
	title: l.name,
	icon: 'ti ti-star',
	iconOnly: true,
}))), ...availableBasicTimelines().map(tl => ({
	key: tl,
	title: localeRef.value.env._timelines[tl],
	icon: basicTimelineIconClass(tl),
	iconOnly: true,
})), {
	icon: 'ti ti-list',
	title: localeRef.value.env.lists,
	iconOnly: true,
	onClick: chooseList,
}, {
	icon: 'ti ti-antenna',
	title: localeRef.value.env.antennas,
	iconOnly: true,
	onClick: chooseAntenna,
}, {
	icon: 'ti ti-device-tv',
	title: localeRef.value.env.channel,
	iconOnly: true,
	onClick: chooseChannel,
}] as Tab[]);

const headerTabsWhenNotLogin = computed(() => [...availableBasicTimelines().map(tl => ({
	key: tl,
	title: localeRef.value.env._timelines[tl],
	icon: basicTimelineIconClass(tl),
	iconOnly: true,
}))] as Tab[]);

definePage(() => ({
	title: localeRef.value.env.timeline,
	icon: isBasicTimeline(src.value) ? basicTimelineIconClass(src.value) : 'ti ti-home',
}));
</script>

<style lang="scss" module>
.new {
	position: sticky;
	top: calc(var(--MI-stickyTop, 0px) + 16px);
	z-index: 1000;
	width: 100%;
	margin: calc(-0.675em - 8px) 0;

	&:first-child {
		margin-top: calc(-0.675em - 8px - var(--MI-margin));
	}
}

.newButton {
	display: block;
	margin: var(--MI-margin) auto 0 auto;
	padding: 8px 16px;
	border-radius: 32px;
}

.postForm {
	border-radius: var(--MI-radius);
}

.tl {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	overflow: clip;
}
</style>
