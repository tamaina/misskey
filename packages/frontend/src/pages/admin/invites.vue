<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 800px;">
		<div class="_gaps_m">
			<MkFolder :expanded="false">
				<template #icon><i class="ti ti-plus"></i></template>
				<template #label>{{ $locale.env.createInviteCode }}</template>

				<div class="_gaps_m">
					<MkSwitch v-model="noExpirationDate">
						<template #label>{{ $locale.env.noExpirationDate }}</template>
					</MkSwitch>
					<MkInput v-if="!noExpirationDate" v-model="expiresAt" type="datetime-local">
						<template #label>{{ $locale.env.expirationDate }}</template>
					</MkInput>
					<MkInput v-model="createCount" type="number" :min="1">
						<template #label>{{ $locale.env.createCount }}</template>
					</MkInput>
					<MkButton primary rounded @click="createWithOptions">{{ $locale.env.create }}</MkButton>
				</div>
			</MkFolder>

			<div :class="$style.inputs">
				<MkSelect v-model="type" :items="typeDef" :class="$style.input">
					<template #label>{{ $locale.env.state }}</template>
				</MkSelect>
				<MkSelect v-model="sort" :items="sortDef" :class="$style.input">
					<template #label>{{ $locale.env.sort }}</template>
				</MkSelect>
			</div>
			<MkPagination :paginator="paginator">
				<template #default="{ items }">
					<div class="_gaps_s">
						<MkInviteCode v-for="item in items" :key="item.id" :invite="item" :onDeleted="deleted" moderator/>
					</div>
				</template>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import * as Misskey from 'misskey-js';
import { computed, markRaw, ref, useTemplateRef } from 'vue';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkInput from '@/components/MkInput.vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkInviteCode from '@/components/MkInviteCode.vue';
import { definePage } from '@/page.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
import { Paginator } from '@/utility/paginator.js';

const {
	model: type,
	def: typeDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'all' },
		{ label: localeRef.value.env.unused, value: 'unused' },
		{ label: localeRef.value.env.used, value: 'used' },
		{ label: localeRef.value.env.expired, value: 'expired' },
	],
	initialValue: 'all',
});
const {
	model: sort,
	def: sortDef,
} = useMkSelect({
	items: [
		{ label: `${localeRef.value.env.createdAt} (${localeRef.value.env.ascendingOrder})`, value: '+createdAt' },
		{ label: `${localeRef.value.env.createdAt} (${localeRef.value.env.descendingOrder})`, value: '-createdAt' },
		{ label: `${localeRef.value.env.usedAt} (${localeRef.value.env.ascendingOrder})`, value: '+usedAt' },
		{ label: `${localeRef.value.env.usedAt} (${localeRef.value.env.descendingOrder})`, value: '-usedAt' },
	],
	initialValue: '+createdAt',
});

const paginator = markRaw(new Paginator('admin/invite/list', {
	limit: 10,
	computedParams: computed(() => ({
		type: type.value,
		sort: sort.value,
	})),
	offsetMode: true,
}));

const expiresAt = ref('');
const noExpirationDate = ref(true);
const createCount = ref(1);

async function createWithOptions() {
	const options = {
		expiresAt: noExpirationDate.value ? null : expiresAt.value,
		count: createCount.value,
	};

	const tickets = await misskeyApi('admin/invite/create', options);
	os.alert({
		type: 'success',
		title: localeRef.value.env.inviteCodeCreated,
		text: tickets.map(x => x.code).join('\n'),
	});

	tickets.forEach(ticket => paginator.prepend(ticket));
}

function deleted(id: string) {
	paginator.removeItem(id);
}

const headerActions = computed(() => []);
const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.invite,
	icon: 'ti ti-user-plus',
}));
</script>

<style lang="scss" module>
.inputs {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.input {
	flex: 1;
}
</style>
