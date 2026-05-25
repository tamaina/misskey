<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader v-model:tab="tab" :actions="headerActions" :tabs="headerTabs" :swipable="true">
	<div class="_spacer _gaps" style="--MI_SPACER-w: 700px;">
		<MkTip k="clips">
			{{ $locale.env._clip.tip }}
		</MkTip>
		<div v-if="tab === 'my'" class="_gaps">
			<MkButton primary rounded class="add" @click="create"><i class="ti ti-plus"></i> {{ $locale.env.add }}</MkButton>

			<MkPagination v-slot="{ items }" :paginator="paginator" class="_gaps" withControl>
				<MkClipPreview v-for="item in items" :key="item.id" :clip="item" :noUserInfo="true"/>
			</MkPagination>
		</div>
		<div v-else-if="tab === 'favorites'">
			<MkPagination v-slot="{ items }" :paginator="favoritesPaginator" class="_gaps" withControl>
				<MkClipPreview v-for="item in items" :key="item.id" :clip="item" :noUserInfo="true"/>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { watch, ref, computed, markRaw } from 'vue';
import * as Misskey from 'misskey-js';
import MkPagination from '@/components/MkPagination.vue';
import MkButton from '@/components/MkButton.vue';
import MkClipPreview from '@/components/MkClipPreview.vue';
import * as os from '@/os.js';
import { definePage } from '@/page.js';
import { clipsCache } from '@/cache.js';
import { Paginator } from '@/utility/paginator.js';

const tab = ref('my');

const paginator = markRaw(new Paginator('clips/list', {
}));

const favoritesPaginator = markRaw(new Paginator('clips/my-favorites', {
	// ページネーションに対応していない
	noPaging: true,
}));

async function create() {
	const { canceled, result } = await os.form(localeRef.value.env.createNewClip, {
		name: {
			type: 'string',
			label: localeRef.value.env.name,
		},
		description: {
			type: 'string',
			required: false,
			multiline: true,
			treatAsMfm: true,
			label: localeRef.value.env.description,
		},
		isPublic: {
			type: 'boolean',
			label: localeRef.value.env.public,
			default: false,
		},
	});

	if (canceled) return;

	os.apiWithDialog('clips/create', result);

	clipsCache.delete();

	paginator.reload();
}

function onClipCreated() {
	paginator.reload();
}

function onClipDeleted() {
	paginator.reload();
}

const headerActions = computed(() => []);

const headerTabs = computed(() => [{
	key: 'my',
	title: localeRef.value.env.myClips,
	icon: 'ti ti-paperclip',
}, {
	key: 'favorites',
	title: localeRef.value.env.favorites,
	icon: 'ti ti-heart',
}]);

definePage(() => ({
	title: localeRef.value.env.clip,
	icon: 'ti ti-paperclip',
}));
</script>

<style lang="scss" module>

</style>
