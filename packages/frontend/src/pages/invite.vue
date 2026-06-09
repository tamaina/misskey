<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<PageWithHeader>
	<div v-if="!instance.disableRegistration || !($i && ($i.isAdmin || $i.policies.canInvite))" class="_spacer" style="--MI_SPACER-w: 1200px;">
		<MkResult type="empty"/>
	</div>
	<div v-else class="_spacer" style="--MI_SPACER-w: 800px;">
		<div class="_gaps_m" style="text-align: center;">
			<div v-if="resetCycle && inviteLimit">{{ $l.env.inviteLimitResetCycle({ time: resetCycle, limit: inviteLimit }) }}</div>
			<MkButton inline primary rounded :disabled="currentInviteLimit !== null && currentInviteLimit <= 0" @click="create"><i class="ti ti-user-plus"></i> {{ $locale.env.createInviteCode }}</MkButton>
			<div v-if="currentInviteLimit !== null">{{ $l.env.createLimitRemaining({ limit: currentInviteLimit }) }}</div>

			<MkPagination :paginator="paginator">
				<template #default="{ items }">
					<div class="_gaps_s">
						<MkInviteCode v-for="item in items" :key="item.id" :invite="item" :onDeleted="deleted"/>
					</div>
				</template>
			</MkPagination>
		</div>
	</div>
</PageWithHeader>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { computed, markRaw, ref } from 'vue';
import * as Misskey from 'misskey-js';
import * as os from '@/os.js';
import { misskeyApi } from '@/utility/misskey-api.js';
import MkButton from '@/components/MkButton.vue';
import MkPagination from '@/components/MkPagination.vue';
import MkInviteCode from '@/components/MkInviteCode.vue';
import { definePage } from '@/page.js';
import { instance } from '@/instance.js';
import { $i } from '@/i.js';
import { Paginator } from '@/utility/paginator.js';
const localeRef = useLocale(import.meta.url);

const currentInviteLimit = ref<null | number>(null);
const inviteLimit = (($i != null && $i.policies.inviteLimit) || (($i == null && instance.policies.inviteLimit))) as number;
const inviteLimitCycle = (($i != null && $i.policies.inviteLimitCycle) || ($i == null && instance.policies.inviteLimitCycle)) as number;

const paginator = markRaw(new Paginator('invite/list', {
	limit: 10,
}));

const resetCycle = computed<null | string>(() => {
	if (!inviteLimitCycle) return null;

	const minutes = inviteLimitCycle;
	if (minutes < 60) return minutes + localeRef.value.env._time.minute;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return hours + localeRef.value.env._time.hour;
	return Math.floor(hours / 24) + localeRef.value.env._time.day;
});

async function create() {
	const ticket = await misskeyApi('invite/create');
	os.alert({
		type: 'success',
		title: localeRef.value.env.inviteCodeCreated,
		text: ticket.code,
	});

	paginator.prepend(ticket);
	update();
}

function deleted(id: string) {
	paginator.removeItem(id);
	update();
}

async function update() {
	currentInviteLimit.value = (await misskeyApi('invite/limit')).remaining;
}

update();

definePage(() => ({
	title: localeRef.value.env.invite,
	icon: 'ti ti-user-plus',
}));
</script>
