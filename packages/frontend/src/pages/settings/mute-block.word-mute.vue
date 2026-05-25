<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<div>
		<MkTextarea v-model="mutedWords">
			<span>{{ $locale.env._wordMute.muteWords }}</span>
			<template #caption>{{ $locale.env._wordMute.muteWordsDescription }}<br>{{ $locale.env._wordMute.muteWordsDescription2 }}</template>
		</MkTextarea>
	</div>
	<MkButton primary inline :disabled="!changed" @click="save()"><i class="ti ti-device-floppy"></i> {{ $locale.env.save }}</MkButton>
</div>
</template>

<script lang="ts" setup>
import { $locale as localeRef, $l as localizerRef } from '@/i18n.js';

import { ref, watch } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';

const props = defineProps<{
	muted: (string[] | string)[];
}>();

const emit = defineEmits<{
	(ev: 'save', value: (string[] | string)[]): void;
}>();

const render = (mutedWords: (string | string[])[]) => mutedWords.map(x => {
	if (Array.isArray(x)) {
		return x.join(' ');
	} else {
		return x;
	}
}).join('\n');

const mutedWords = ref(render(props.muted));
const changed = ref(false);

watch(mutedWords, () => {
	changed.value = true;
});

async function save() {
	const parseMutes = (mutes: string) => {
		// split into lines, remove empty lines and unnecessary whitespace
		let lines = mutes.trim().split('\n').map(line => line.trim()).filter(line => line !== '') as (string | string[])[];

		// check each line if it is a RegExp or not
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i] as string;
			const regexp = line.match(/^\/(.+)\/(.*)$/);
			if (regexp) {
				// check that the RegExp is valid
				try {
					new RegExp(regexp[1], regexp[2]);
					// note that regex lines will not be split by spaces!
				} catch (err: any) {
					// invalid syntax: do not save, do not reset changed flag
					os.alert({
						type: 'error',
						title: localeRef.value.env.regexpError,
						text: localizerRef.value.env.regexpErrorDescription({ tab: 'word mute', line: i + 1 }) + '\n' + err.toString(),
					});
					// re-throw error so these invalid settings are not saved
					throw err;
				}
			} else {
				lines[i] = line.split(' ');
			}
		}

		return lines;
	};

	let parsed;
	try {
		parsed = parseMutes(mutedWords.value);
	} catch (err) {
		// already displayed error message in parseMutes
		return;
	}

	emit('save', parsed);

	changed.value = false;
}
</script>
