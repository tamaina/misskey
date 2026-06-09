<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 500px;">
		<div v-if="instance.ads.length > 0" class="_gaps">
			<MkAd v-for="ad in instance.ads" :key="ad.id" :specify="ad"/>
		</div>
		<MkResult v-else type="empty"/>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { definePage } from '@/page.js';
import { instance } from '@/instance.js';
const localeRef = useLocale(import.meta.url);

definePage(() => ({
	title: localeRef.value.env.ads,
	icon: 'ti ti-ad',
}));
</script>

