<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSuspense v-slot="{ result }" :p="_fetch_" @resolved="(result) => file = result.file">
	<XRoot v-if="result.file != null && result.info != null" :file="result.file" :info="result.info"/>
</MkSuspense>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import XRoot from './admin-file.root.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	fileId: string,
}>();

function _fetch_() {
	return Promise.all([
		misskeyApi('drive/files/show', { fileId: props.fileId }),
		misskeyApi('admin/drive/show-file', { fileId: props.fileId }),
	]).then((result) => ({
		file: result[0],
		info: result[1],
	}));
}

const file = ref<Misskey.entities.DriveFile | null>(null);

definePage(() => ({
	title: file.value ? `${localeRef.value.env.file}: ${file.value.name}` : localeRef.value.env.file,
	icon: 'ti ti-file',
}));
</script>
