<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader :actions="headerActions" :tabs="headerTabs">
	<div class="_spacer" style="--MI_SPACER-w: 900px;">
		<div class="_gaps">
			<div>
				<MkInput v-model="host" :debounce="true" class="">
					<template #prefix><i class="ti ti-search"></i></template>
					<template #label>{{ $locale.env.host }}</template>
				</MkInput>
				<FormSplit style="margin-top: var(--MI-margin);">
					<MkSelect v-model="state" :items="stateDef">
						<template #label>{{ $locale.env.state }}</template>
					</MkSelect>
					<MkSelect v-model="sort" :items="sortDef">
						<template #label>{{ $locale.env.sort }}</template>
					</MkSelect>
				</FormSplit>
			</div>

			<MkPagination v-slot="{items}" :key="host + state" :paginator="paginator">
				<div :class="$style.instances">
					<MkA v-for="instance in items" :key="instance.id" v-tooltip.mfm="`Status: ${getStatus(instance)}`" :class="$style.instance" :to="`/instance-info/${instance.host}`">
						<MkInstanceCardMini :instance="instance"/>
					</MkA>
				</div>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import * as Misskey from 'misskey-js';
import { computed, markRaw, ref } from 'vue';
import MkInput from '@/components/MkInput.vue';
import MkSelect from '@/components/MkSelect.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkInstanceCardMini from '@/components/MkInstanceCardMini.vue';
import FormSplit from '@/components/form/split.vue';
import { definePage } from '@/page.js';
import { useMkSelect } from '@/composables/use-mkselect.js';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const host = ref('');
const {
	model: state,
	def: stateDef,
} = useMkSelect({
	items: [
		{ label: localeRef.value.env.all, value: 'all' },
		{ label: localeRef.value.env.federating, value: 'federating' },
		{ label: localeRef.value.env.subscribing, value: 'subscribing' },
		{ label: localeRef.value.env.publishing, value: 'publishing' },
		{ label: localeRef.value.env.suspended, value: 'suspended' },
		{ label: localeRef.value.env.blocked, value: 'blocked' },
		{ label: localeRef.value.env.silence, value: 'silenced' },
		{ label: localeRef.value.env.notResponding, value: 'notResponding' },
	],
	initialValue: 'federating',
});
const {
	model: sort,
	def: sortDef,
} = useMkSelect({
	items: [
		{ label: `${localeRef.value.env.pubSub} (${localeRef.value.env.descendingOrder})`, value: '+pubSub' },
		{ label: `${localeRef.value.env.pubSub} (${localeRef.value.env.ascendingOrder})`, value: '-pubSub' },
		{ label: `${localeRef.value.env.notes} (${localeRef.value.env.descendingOrder})`, value: '+notes' },
		{ label: `${localeRef.value.env.notes} (${localeRef.value.env.ascendingOrder})`, value: '-notes' },
		{ label: `${localeRef.value.env.users} (${localeRef.value.env.descendingOrder})`, value: '+users' },
		{ label: `${localeRef.value.env.users} (${localeRef.value.env.ascendingOrder})`, value: '-users' },
		{ label: `${localeRef.value.env.following} (${localeRef.value.env.descendingOrder})`, value: '+following' },
		{ label: `${localeRef.value.env.following} (${localeRef.value.env.ascendingOrder})`, value: '-following' },
		{ label: `${localeRef.value.env.followers} (${localeRef.value.env.descendingOrder})`, value: '+followers' },
		{ label: `${localeRef.value.env.followers} (${localeRef.value.env.ascendingOrder})`, value: '-followers' },
		{ label: `${localeRef.value.env.registeredAt} (${localeRef.value.env.descendingOrder})`, value: '+firstRetrievedAt' },
		{ label: `${localeRef.value.env.registeredAt} (${localeRef.value.env.ascendingOrder})`, value: '-firstRetrievedAt' },
	],
	initialValue: '+pubSub',
});
const paginator = markRaw(new Paginator('federation/instances', {
	limit: 10,
	offsetMode: true,
	computedParams: computed(() => ({
		sort: sort.value,
		host: host.value !== '' ? host.value : null,
		...(
			state.value === 'federating' ? { federating: true, suspended: false, blocked: false } :
			state.value === 'subscribing' ? { subscribing: true, suspended: false, blocked: false } :
			state.value === 'publishing' ? { publishing: true, suspended: false, blocked: false } :
			state.value === 'suspended' ? { suspended: true } :
			state.value === 'blocked' ? { blocked: true } :
			state.value === 'silenced' ? { silenced: true } :
			state.value === 'notResponding' ? { notResponding: true } :
			{}),
	})),
}));

function getStatus(instance: Misskey.entities.FederationInstance) {
	switch (instance.suspensionState) {
		case 'manuallySuspended':
			return 'Manually Suspended';
		case 'goneSuspended':
			return 'Automatically Suspended (Gone)';
		case 'autoSuspendedForNotResponding':
			return 'Automatically Suspended (Not Responding)';
		case 'none':
			break;
	}
	if (instance.isBlocked) return 'Blocked';
	if (instance.isSilenced) return 'Silenced';
	if (instance.isNotResponding) return 'Error';
	return 'Alive';
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env.federation,
	icon: 'ti ti-whirl',
}));
</script>

<style lang="scss" module>
.instances {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
	grid-gap: 12px;
}

.instance:hover {
	text-decoration: none;
}
</style>
