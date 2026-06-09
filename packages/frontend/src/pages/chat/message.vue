<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 700px;">
		<div v-if="initializing || message == null">
			<MkLoading/>
		</div>
		<div v-else>
			<XMessage :message="message" :isSearchResult="true"/>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, onMounted } from 'vue';
import * as Misskey from 'misskey-js';
import XMessage from './XMessage.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	messageId: string;
}>();

const initializing = ref(true);
const message = ref<Misskey.entities.ChatMessage | null>();

async function initialize() {
	initializing.value = true;

	message.value = await misskeyApi('chat/messages/show', {
		messageId: props.messageId,
	});

	initializing.value = false;
}

onMounted(() => {
	initialize();
});

definePage({
	title: localeRef.value.env.directMessage,
});
</script>
