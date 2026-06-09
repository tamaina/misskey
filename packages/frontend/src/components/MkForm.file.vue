<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<MkButton inline rounded primary @click="selectButton($event)">{{ $locale.env.selectFile }}</MkButton>
	<div :class="['_nowrap', !fileName && $style.fileNotSelected]">{{ friendlyFileName }}</div>
</div>
</template>

<script setup lang="ts">
import { useLocale } from 'virtual:vite-vue-internationalization';

import * as Misskey from 'misskey-js';
import { computed, ref } from 'vue';
import MkButton from '@/components/MkButton.vue';
import { selectFile } from '@/utility/drive.js';
import { misskeyApi } from '@/utility/misskey-api.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	fileId?: string | null;
	validate?: (file: Misskey.entities.DriveFile) => Promise<boolean>;
}>();

const emit = defineEmits<{
	(ev: 'update', result: Misskey.entities.DriveFile): void;
}>();

const fileUrl = ref('');
const fileName = ref<string>('');

const friendlyFileName = computed<string>(() => {
	if (fileName.value) {
		return fileName.value;
	}
	if (fileUrl.value) {
		return fileUrl.value;
	}

	return localeRef.value.env.fileNotSelected;
});

if (props.fileId) {
	misskeyApi('drive/files/show', {
		fileId: props.fileId,
	}).then((apiRes) => {
		fileName.value = apiRes.name;
		fileUrl.value = apiRes.url;
	});
}

function selectButton(ev: PointerEvent) {
	selectFile({
		anchorElement: ev.currentTarget ?? ev.target,
		multiple: false,
	}).then(async (file) => {
		if (!file) return;
		if (props.validate && !await props.validate(file)) return;

		emit('update', file);
		fileName.value = file.name;
		fileUrl.value = file.url;
	});
}

</script>

<style module>
.fileNotSelected {
	font-weight: 700;
	color: var(--MI_THEME-infoWarnFg);
}
</style>
