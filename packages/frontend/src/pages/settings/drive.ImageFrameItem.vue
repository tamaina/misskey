<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkFolder :defaultOpen="false" :canPage="false">
	<template #icon><i class="ti ti-pencil"></i></template>
	<template #label>{{ $locale.env.preset }}: {{ preset.name === '' ? '(' + $locale.env.noName + ')' : preset.name }}</template>
	<template #footer>
		<div class="_buttons">
			<MkButton @click="edit"><i class="ti ti-pencil"></i> {{ $locale.env.edit }}</MkButton>
			<MkButton danger iconOnly style="margin-left: auto;" @click="del"><i class="ti ti-trash"></i></MkButton>
		</div>
	</template>

	<div>
		<canvas ref="canvasEl" :class="$style.previewCanvas"></canvas>
	</div>
</MkFolder>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { defineAsyncComponent, onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue';
import type { ImageFramePreset } from '@/utility/image-frame-renderer/ImageFrameRenderer.js';
import { ImageFrameRenderer } from '@/utility/image-frame-renderer/ImageFrameRenderer.js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { deepClone } from '@/utility/clone.js';
import MkFolder from '@/components/MkFolder.vue';
const localeRef = useLocale(import.meta.url);

const props = defineProps<{
	preset: ImageFramePreset;
}>();

const emit = defineEmits<{
	(ev: 'updatePreset', preset: ImageFramePreset): void,
	(ev: 'del'): void,
}>();

async function edit() {
	const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkImageFrameEditorDialog.vue')), {
		presetEditMode: true,
		preset: deepClone(props.preset),
		params: deepClone(props.preset.params),
	}, {
		presetOk: (preset) => {
			emit('updatePreset', preset);
		},
		closed: () => dispose(),
	});
}

function del(ev: PointerEvent) {
	os.popupMenu([{
		text: localeRef.value.env.delete,
		action: () => {
			emit('del');
		},
	}], ev.currentTarget ?? ev.target);
}

const canvasEl = useTemplateRef('canvasEl');

const sampleImage = new Image();
sampleImage.src = '/client-assets/sample/3-2.jpg';

let renderer: ImageFrameRenderer | null = null;

onMounted(() => {
	sampleImage.onload = async () => {
		watch(canvasEl, async () => {
			if (canvasEl.value == null) return;

			renderer = new ImageFrameRenderer({
				canvas: canvasEl.value,
				image: sampleImage,
				exif: null,
				caption: 'Example caption',
				filename: 'example_file_name.jpg',
				renderAsPreview: true,
			});

			await renderer.render(props.preset.params);
		}, { immediate: true });
	};
});

onUnmounted(() => {
	if (renderer != null) {
		renderer.destroy();
		renderer = null;
	}
});

watch(() => props.preset, async () => {
	if (renderer != null) {
		await renderer.render(props.preset.params);
	}
}, { deep: true });
</script>

<style lang="scss" module>
.previewCanvas {
	display: block;
	width: 100%;
	height: 100%;
	max-height: 200px;
	box-sizing: border-box;
	object-fit: contain;
}
</style>
