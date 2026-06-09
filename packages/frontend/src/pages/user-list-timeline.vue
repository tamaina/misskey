<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<div :class="$style.tl">
			<MkStreamingNotesTimeline
				ref="tlEl" :key="listId"
				src="list"
				:list="listId"
				:sound="true"
			/>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, watch, ref, useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkStreamingNotesTimeline from '@/components/MkStreamingNotesTimeline.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import { useRouter } from '@/router.js';
const localeRef = useLocale(import.meta.url);

const router = useRouter();

const props = defineProps<{
	listId: string;
}>();

const list = ref<Misskey.entities.UserList | null>(null);

watch(() => props.listId, async () => {
	list.value = await misskeyApi('users/lists/show', {
		listId: props.listId,
	});
}, { immediate: true });

function settings() {
	router.push('/my/lists/:listId', {
		params: {
			listId: props.listId,
		},
	});
}

const headerActions = computed(() => list.value ? [{
	icon: 'ti ti-settings',
	text: localeRef.value.env.settings,
	handler: settings,
}] : []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: list.value ? list.value.name : localeRef.value.env.lists,
	icon: 'ti ti-list',
}));
</script>

<style lang="scss" module>
.tl {
	background: var(--MI_THEME-bg);
	border-radius: var(--MI-radius);
	overflow: clip;
}
</style>
