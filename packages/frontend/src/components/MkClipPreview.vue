<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkA :to="`/clips/${clip.id}`" :class="$style.link">
	<div :class="$style.root" class="_panel _gaps_s">
		<b>{{ clip.name }}</b>
		<div :class="$style.description">
			<div v-if="clip.description"><Mfm :text="clip.description" :plain="true" :nowrap="true"/></div>
			<div v-if="clip.lastClippedAt">{{ $locale.env.updatedAt }}: <MkTime :time="clip.lastClippedAt" mode="detail"/></div>
			<div v-if="clip.notesCount != null">{{ $locale.env.notesCount }}: {{ number(clip.notesCount) }} / {{ $i?.policies.noteEachClipsLimit }} ({{ $l.env.remainingN({ n: remaining }) }})</div>
		</div>
		<template v-if="!props.noUserInfo">
			<div :class="$style.divider"></div>
			<div>
				<MkAvatar :user="clip.user" :class="$style.userAvatar" indicator link preview/> <MkUserName :user="clip.user" :nowrap="false"/>
			</div>
		</template>
	</div>
</MkA>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import * as Misskey from 'misskey-js';
import { computed } from 'vue';
import { $i } from '@/i.js';
import number from '@/filters/number.js';
const localeRef = useLocale(import.meta.url);

const props = withDefaults(defineProps<{
	clip: Misskey.entities.Clip;
	noUserInfo?: boolean;
}>(), {
	noUserInfo: false,
});

const remaining = computed(() => {
	return ($i?.policies && props.clip.notesCount != null) ? ($i.policies.noteEachClipsLimit - props.clip.notesCount) : localeRef.value.env.unknown;
});
</script>

<style lang="scss" module>
.link {
	display: block;

	&:focus-visible {
		outline: none;

		.root {
			box-shadow: inset 0 0 0 2px var(--MI_THEME-focus);
		}
	}

	&:hover {
		text-decoration: none;
		color: var(--MI_THEME-accent);
	}
}

.root {
	padding: 16px;
}

.divider {
	height: 1px;
	background: var(--MI_THEME-divider);
}

.description {
	font-size: 90%;
}

.userAvatar {
	width: 32px;
	height: 32px;
}
</style>
