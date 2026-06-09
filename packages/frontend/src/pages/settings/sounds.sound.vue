<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkSelect v-model="type" :items="typeDef">
		<template #label>{{ $locale.env.sound }}</template>
	</MkSelect>
	<div v-if="type === '_driveFile_' && driveFileError === true" :class="$style.fileSelectorRoot">
		<MkButton :class="$style.fileSelectorButton" inline rounded primary @click="selectSound">{{ $locale.env.selectFile }}</MkButton>
		<div :class="$style.fileErrorRoot">
			<MkCondensedLine>{{ $locale.env._soundSettings.driveFileError }}</MkCondensedLine>
		</div>
	</div>
	<div v-else-if="type === '_driveFile_'" :class="$style.fileSelectorRoot">
		<MkButton :class="$style.fileSelectorButton" inline rounded primary @click="selectSound">{{ $locale.env.selectFile }}</MkButton>
		<div :class="['_nowrap', !fileUrl && $style.fileNotSelected]">{{ friendlyFileName }}</div>
	</div>
	<MkRange v-model="volume" :min="0" :max="1" :step="0.05" :textConverter="(v) => `${Math.floor(v * 100)}%`">
		<template #label>{{ $locale.env.volume }}</template>
	</MkRange>

	<div class="_buttons">
		<MkButton inline @click="listen"><i class="ti ti-player-play"></i> {{ $locale.env.listen }}</MkButton>
		<MkButton inline primary :disabled="!hasChanged || driveFileError" @click="save"><i class="ti ti-check"></i> {{ $locale.env.save }}</MkButton>
	</div>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, computed, watch } from 'vue';
import type { SoundType } from '@/utility/sound.js';
import type { SoundStore } from '@/preferences/def.js';
import MkSelect from '@/components/MkSelect.vue';
import MkButton from '@/components/MkButton.vue';
import MkRange from '@/components/MkRange.vue';
import * as os from '@/os.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import { playMisskeySfxFile, soundsTypes, getSoundDuration } from '@/utility/sound.js';
import { selectFile } from '@/utility/drive.js';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	def: SoundStore;
}>();

const emit = defineEmits<{
	(ev: 'update', result: { type: SoundType; fileId?: string; fileUrl?: string; volume: number; }): void;
}>();

const {
	model: type,
	def: typeDef,
} = useMkSelect({
	items: soundsTypes.map((x) => ({
		label: getSoundTypeName(x),
		value: x,
	})),
	initialValue: props.def.type,
});
const fileId = ref('fileId' in props.def ? props.def.fileId : undefined);
const fileUrl = ref('fileUrl' in props.def ? props.def.fileUrl : undefined);
const fileName = ref<string>('');
const driveFileError = ref(false);
const hasChanged = ref(false);
const volume = ref(props.def.volume);

if (type.value === '_driveFile_' && fileId.value) {
	await misskeyApi('drive/files/show', {
		fileId: fileId.value,
	}).then((res) => {
		fileName.value = res.name;
	}).catch((res) => {
		driveFileError.value = true;
	});
}

function getSoundTypeName(f: SoundType): string {
	switch (f) {
		case null:
			return localeRef.value.env.none;
		case '_driveFile_':
			return localeRef.value.env._soundSettings.driveFile;
		default:
			return f;
	}
}

const friendlyFileName = computed<string>(() => {
	if (fileName.value) {
		return fileName.value;
	}
	if (fileUrl.value) {
		return fileUrl.value;
	}

	return localeRef.value.env._soundSettings.driveFileWarn;
});

function selectSound(ev: PointerEvent) {
	selectFile({
		anchorElement: ev.currentTarget ?? ev.target,
		multiple: false,
		label: localeRef.value.env._soundSettings.driveFile,
	}).then(async (file) => {
		if (!file.type.startsWith('audio')) {
			os.alert({
				type: 'warning',
				title: localeRef.value.env._soundSettings.driveFileTypeWarn,
				text: localeRef.value.env._soundSettings.driveFileTypeWarnDescription,
			});
			return;
		}
		const duration = await getSoundDuration(file.url);
		if (duration >= 2000) {
			const { canceled } = await os.confirm({
				type: 'warning',
				title: localeRef.value.env._soundSettings.driveFileDurationWarn,
				text: localeRef.value.env._soundSettings.driveFileDurationWarnDescription,
				okText: localeRef.value.env.continue,
				cancelText: localeRef.value.env.cancel,
			});
			if (canceled) return;
		}

		fileUrl.value = file.url;
		fileName.value = file.name;
		fileId.value = file.id;
		driveFileError.value = false;
		hasChanged.value = true;
	});
}

watch([type, volume], ([typeTo, volumeTo], [typeFrom, volumeFrom]) => {
	if (typeFrom !== typeTo && typeTo !== '_driveFile_') {
		fileUrl.value = undefined;
		fileName.value = '';
		fileId.value = undefined;
		driveFileError.value = false;
	}
	hasChanged.value = true;
});

function listen() {
	if (type.value === '_driveFile_' && (!fileUrl.value || !fileId.value)) {
		os.alert({
			type: 'warning',
			text: localeRef.value.env._soundSettings.driveFileWarn,
		});
		return;
	}

	playMisskeySfxFile(type.value === '_driveFile_' ? {
		type: '_driveFile_',
		fileId: fileId.value as string,
		fileUrl: fileUrl.value as string,
		volume: volume.value,
	} : {
		type: type.value,
		volume: volume.value,
	});
}

function save() {
	if (hasChanged.value === false || driveFileError.value === true) {
		return;
	}

	if (type.value === '_driveFile_' && !fileUrl.value) {
		os.alert({
			type: 'warning',
			text: localeRef.value.env._soundSettings.driveFileWarn,
		});
		return;
	}

	if (type.value !== '_driveFile_') {
		fileUrl.value = undefined;
		fileName.value = '';
		fileId.value = undefined;
	}

	emit('update', {
		type: type.value,
		fileId: fileId.value,
		fileUrl: fileUrl.value,
		volume: volume.value,
	});

	os.success();
}
</script>

<style module>
.fileSelectorRoot {
	display: flex;
	align-items: center;
	gap: 8px;
}

.fileErrorRoot {
	flex-grow: 1;
	min-width: 0;
	font-weight: 700;
	color: var(--MI_THEME-error);
}

.fileSelectorButton {
	flex-shrink: 0;
}

.fileNotSelected {
	font-weight: 700;
	color: var(--MI_THEME-infoWarnFg);
}
</style>
