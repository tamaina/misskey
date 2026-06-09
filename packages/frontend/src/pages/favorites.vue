<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<MkPagination :paginator="paginator">
			<template #empty><MkResult type="empty" :text="$locale.env.noNotes"/></template>

			<template #default="{ items }">
				<MkNote v-for="item in items" :key="item.id" :note="item.note" :class="$style.note"/>
			</template>
		</MkPagination>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { markRaw } from 'vue';
import MkPagination from '@/components/MkPagination.vue';
import MkNote from '@/components/MkNote.vue';
import { definePage } from '@/page.js';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const paginator = markRaw(new Paginator('i/favorites', {
	limit: 10,
}));

definePage(() => ({
	title: localeRef.value.env.favorites,
	icon: 'ti ti-star',
}));
</script>

<style lang="scss" module>
.note {
	background: var(--MI_THEME-panel);
	border-radius: var(--MI-radius);
}
</style>
