<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkModalWindow
	ref="dialog"
	:withOkButton="false"
	:width="500"
	:height="550"
	@close="close()"
	@closed="emit('closed')"
>
	<template #header>{{ antenna == null ? $locale.env.createAntenna : $locale.env.editAntenna }}</template>
	<XAntennaEditor
		:antenna="antenna"
		@created="onAntennaCreated"
		@updated="onAntennaUpdated"
		@deleted="onAntennaDeleted"
	/>
</MkModalWindow>
</template>

<script lang="ts" setup>

import { useTemplateRef } from 'vue';
import * as Misskey from 'misskey-js';
import MkModalWindow from '@/components/MkModalWindow.vue';
import XAntennaEditor from '@/components/MkAntennaEditor.vue';

defineProps<{
	antenna?: Misskey.entities.Antenna;
}>();

const emit = defineEmits<{
	(ev: 'created', newAntenna: Misskey.entities.Antenna): void,
	(ev: 'updated', editedAntenna: Misskey.entities.Antenna): void,
	(ev: 'deleted'): void,
	(ev: 'closed'): void,
}>();

const dialog = useTemplateRef('dialog');

function onAntennaCreated(newAntenna: Misskey.entities.Antenna) {
	emit('created', newAntenna);
	dialog.value?.close();
}

function onAntennaUpdated(editedAntenna: Misskey.entities.Antenna) {
	emit('updated', editedAntenna);
	dialog.value?.close();
}

function onAntennaDeleted() {
	emit('deleted');
	dialog.value?.close();
}

function close() {
	dialog.value?.close();
}
</script>
