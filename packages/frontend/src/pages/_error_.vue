<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkLoading v-if="!loaded"/>
<Transition :name="prefer.s.animation ? '_transition_zoom' : ''" appear>
	<div v-show="loaded" :class="$style.root">
		<img v-if="instance.serverErrorImageUrl" :src="instance.serverErrorImageUrl" draggable="false" :class="$style.img"/>
		<div class="_gaps">
			<div><b><i class="ti ti-alert-triangle"></i> {{ $locale.env.pageLoadError }}</b></div>
			<div v-if="meta && (version === meta.version)">{{ $locale.env.pageLoadErrorDescription }}</div>
			<div v-else-if="serverIsDead">{{ $locale.env.serverIsDead }}</div>
			<template v-else>
				<div>{{ $locale.env.newVersionOfClientAvailable }}</div>
				<div>{{ $locale.env.youShouldUpgradeClient }}</div>
				<MkButton style="margin: 8px auto;" @click="reload">{{ $locale.env.reload }}</MkButton>
			</template>
			<div><MkLink url="https://misskey-hub.net/docs/for-users/resources/troubleshooting/" target="_blank">{{ $locale.env.troubleshooting }}</MkLink></div>
			<div v-if="error" style="opacity: 0.7;">ERROR: {{ error }}</div>
		</div>
	</div>
</Transition>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, computed } from 'vue';
import * as Misskey from 'misskey-js';
import { version } from '@@/js/config.js';
import MkButton from '@/components/MkButton.vue';
import MkLink from '@/components/MkLink.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { unisonReload } from '@/utility/unison-reload.js';
import { definePage } from '@/page.js';
import { miLocalStorage } from '@/local-storage.js';
import { prefer } from '@/preferences.js';
import { instance } from '@/instance.js';
const localeRef = useLocale(import.meta.url);

const props = withDefaults(defineProps<{
	error?: Error;
}>(), {
});

const loaded = ref(false);
const serverIsDead = ref(false);
const meta = ref<Misskey.entities.MetaResponse | null>(null);

misskeyApi('meta', {
	detail: false,
}).then(res => {
	loaded.value = true;
	serverIsDead.value = false;
	meta.value = res;
	miLocalStorage.setItem('v', res.version);
}, () => {
	loaded.value = true;
	serverIsDead.value = true;
});

function reload() {
	unisonReload();
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.error,
	icon: 'ti ti-alert-triangle',
}));
</script>

<style lang="scss" module>
.root {
	padding: 32px;
	text-align: center;
}

.img {
	vertical-align: bottom;
	height: 128px;
	margin-bottom: 24px;
	border-radius: 16px;
}
</style>
