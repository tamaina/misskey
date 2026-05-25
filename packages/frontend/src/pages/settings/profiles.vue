<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<SearchMarker path="/settings/profiles" :label="$locale.env._preferencesProfile.manageProfiles" :keywords="['profile', 'settings', 'preferences', 'manage']" icon="ti ti-settings-cog">
	<div class="_gaps">
		<MkFolder v-for="backup in backups">
			<template #label>{{ backup.name }}</template>
			<MkButton danger @click="del(backup)">{{ $locale.env.delete }}</MkButton>
		</MkFolder>
	</div>
</SearchMarker>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { computed } from 'vue';
import MkButton from '@/components/MkButton.vue';
import MkFolder from '@/components/MkFolder.vue';
import { definePage } from '@/page.js';
import { deleteCloudBackup, listCloudBackups } from '@/preferences/utility.js';

const backups = await listCloudBackups();

function del(backup: { name: string }): void {
	deleteCloudBackup(backup.name);
}

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePage(() => ({
	title: localeRef.value.env._preferencesProfile.manageProfiles,
	icon: 'ti ti-settings-cog',
}));
</script>

<style lang="scss" module>
</style>
