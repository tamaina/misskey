<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInfo>{{ $locale.env._fileViewer.thisPageCanBeSeenFromTheAuthor }}</MkInfo>

	<MkPagination :paginator="paginator">
		<template #default="{ items }">
			<XMessage v-for="item in items" :key="item.id" :message="item" :isSearchResult="true"/>
		</template>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>

import { ref, computed, markRaw } from 'vue';
import XMessage from './chat/XMessage.vue';
import MkInfo from '@/components/MkInfo.vue';
import { Paginator } from '@/utility/paginator.js';
import MkPagination from '@/components/MkPagination.vue';

const props = defineProps<{
	fileId: string;
}>();

const realFileId = computed(() => props.fileId);

const paginator = markRaw(new Paginator('drive/files/attached-chat-messages', {
	limit: 10,
	params: {
		fileId: realFileId.value,
	},
}));
</script>
