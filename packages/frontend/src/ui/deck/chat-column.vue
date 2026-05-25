<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<XColumn :column="column" :isStacked="isStacked">
	<template #header><i class="ti ti-messages" style="margin-right: 8px;"></i>{{ column.name || $locale.env._deck._columns.chat }}</template>

	<div style="padding: 8px;" class="_gaps">
		<MkInfo v-if="$i.policies.chatAvailability === 'readonly'">{{ $locale.env._chat.chatIsReadOnlyForThisAccountOrServer }}</MkInfo>
		<MkInfo v-else-if="$i.policies.chatAvailability === 'unavailable'" warn>{{ $locale.env._chat.chatNotAvailableForThisAccountOrServer }}</MkInfo>
		<MkChatHistories v-if="$i.policies.chatAvailability !== 'unavailable'"/>
	</div>
</XColumn>
</template>

<script lang="ts" setup>

import { ensureSignin } from '@/i.js';
import { i18n } from '../../i18n.js';
import XColumn from './column.vue';
import type { Column } from '@/deck.js';
import MkInfo from '@/components/MkInfo.vue';
import MkChatHistories from '@/components/MkChatHistories.vue';

defineProps<{
	column: Column;
	isStacked: boolean;
}>();

const $i = ensureSignin();
</script>
