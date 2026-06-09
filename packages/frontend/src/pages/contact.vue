<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 600px; --MI_SPACER-min: 20px;">
		<div class="_gaps_m">
			<MkKeyValue :copy="instance.maintainerName">
				<template #key>{{ $locale.env.administrator }}</template>
				<template #value>
					<template v-if="instance.maintainerName">{{ instance.maintainerName }}</template>
					<span v-else style="opacity: 0.7;">({{ $locale.env.none }})</span>
				</template>
			</MkKeyValue>
			<MkKeyValue :copy="instance.maintainerEmail">
				<template #key>{{ $locale.env.contact }}</template>
				<template #value>
					<template v-if="instance.maintainerEmail">{{ instance.maintainerEmail }}</template>
					<span v-else style="opacity: 0.7;">({{ $locale.env.none }})</span>
				</template>
			</MkKeyValue>
			<MkKeyValue :copy="instance.inquiryUrl">
				<template #key>{{ $locale.env.inquiry }}</template>
				<template #value>
					<MkLink v-if="instance.inquiryUrl" :url="instance.inquiryUrl" target="_blank">{{ instance.inquiryUrl }}</MkLink>
					<span v-else style="opacity: 0.7;">({{ $locale.env.none }})</span>
				</template>
			</MkKeyValue>
			<MkFolder @opened="onOpened">
				<template #icon><i class="ti ti-report-search"></i></template>
				<template #label>{{ $locale.env.deviceInfo }}</template>
				<template #caption>{{ $locale.env.deviceInfoDescription }}</template>
				<MkLoading v-if="userEnv == null"/>
				<MkCode v-else lang="json" :code="JSON.stringify(userEnv, null, 2)" style="max-height: 300px; overflow: auto;"/>
			</MkFolder>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref } from 'vue';
import type { UserEnvironment } from '@/utility/get-user-environment.js';
import { instance } from '@/instance.js';
import { definePage } from '@/page.js';
import { getUserEnvironment } from '@/utility/get-user-environment.js';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkLink from '@/components/MkLink.vue';
import MkCode from '@/components/MkCode.vue';
const localeRef = useLocale(import.meta.url);

const userEnv = ref<UserEnvironment | null>(null);

async function onOpened() {
	if (userEnv.value == null) {
		userEnv.value = await getUserEnvironment();
	}
}

definePage(() => ({
	title: localeRef.value.env.inquiry,
	icon: 'ti ti-help-circle',
}));
</script>
