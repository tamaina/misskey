<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps_m">
	<MkPagination :paginator="paginator">
		<template #empty><MkResult type="empty"/></template>
		<template #default="{items}">
			<div class="_gaps">
				<MkFolder v-for="token in items" :key="token.id" :defaultOpen="true">
					<template #icon>
						<img v-if="token.iconUrl" :class="$style.appIcon" :src="token.iconUrl" alt=""/>
						<i v-else class="ti ti-plug"></i>
					</template>
					<template #label>{{ token.name }}</template>
					<template #caption>{{ token.description }}</template>
					<template v-if="token.lastUsedAt != null" #suffix><MkTime :time="token.lastUsedAt"/></template>
					<template #footer>
						<MkButton danger @click="revoke(token)"><i class="ti ti-trash"></i> {{ $locale.env.delete }}</MkButton>
					</template>

					<div class="_gaps_s">
						<div v-if="token.description">{{ token.description }}</div>
						<div>
							<MkKeyValue oneline>
								<template #key>{{ $locale.env.installedDate }}</template>
								<template #value><MkTime :time="token.createdAt" :mode="'detail'"/></template>
							</MkKeyValue>
							<MkKeyValue v-if="token.lastUsedAt != null" oneline>
								<template #key>{{ $locale.env.lastUsedDate }}</template>
								<template #value><MkTime :time="token.lastUsedAt" :mode="'detail'"/></template>
							</MkKeyValue>
						</div>
						<MkFolder>
							<template #label>{{ $locale.env.permission }}</template>
							<template #suffix>{{ Object.keys(token.permission).length === 0 ? $locale.env.none : Object.keys(token.permission).length }}</template>
							<ul>
								<li v-for="p in token.permission" :key="p">{{ ($locale.env._permissions as any)[p] ?? p }}</li>
							</ul>
						</MkFolder>
					</div>
				</MkFolder>
			</div>
		</template>
	</MkPagination>
</div>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { ref, computed, markRaw } from 'vue';
import * as Misskey from 'misskey-js';
import MkPagination from '@/components/MkPagination.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';
import MkKeyValue from '@/components/MkKeyValue.vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const paginator = markRaw(new Paginator('i/apps', {
	limit: 100,
	noPaging: true,
	params: {
		sort: '+lastUsedAt',
	},
}));

function revoke(token: Misskey.entities.IAppsResponse[number]) {
	misskeyApi('i/revoke-token', { tokenId: token.id }).then(() => {
		paginator.reload();
	});
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.installedApps,
	icon: 'ti ti-plug',
}));
</script>

<style lang="scss" module>
.appIcon {
	display: block;
	width: 20px;
	height: 20px;
	border-radius: 4px;
}
</style>
