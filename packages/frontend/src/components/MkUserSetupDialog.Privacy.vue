<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div class="_gaps">
	<MkInfo>{{ $locale.env._initialAccountSetting.theseSettingsCanEditLater }}</MkInfo>

	<MkFolder>
		<template #label>{{ $locale.env.makeFollowManuallyApprove }}</template>
		<template #icon><i class="ti ti-lock"></i></template>
		<template #suffix>{{ isLocked ? $locale.env.on : $locale.env.off }}</template>

		<MkSwitch v-model="isLocked">{{ $locale.env.makeFollowManuallyApprove }}<template #caption>{{ $locale.env.lockedAccountInfo }}</template></MkSwitch>
	</MkFolder>

	<MkFolder>
		<template #label>{{ $locale.env.hideOnlineStatus }}</template>
		<template #icon><i class="ti ti-eye-off"></i></template>
		<template #suffix>{{ hideOnlineStatus ? $locale.env.on : $locale.env.off }}</template>

		<MkSwitch v-model="hideOnlineStatus">{{ $locale.env.hideOnlineStatus }}<template #caption>{{ $locale.env.hideOnlineStatusDescription }}</template></MkSwitch>
	</MkFolder>

	<MkFolder>
		<template #label>{{ $locale.env.noCrawle }}</template>
		<template #icon><i class="ti ti-world-x"></i></template>
		<template #suffix>{{ noCrawle ? $locale.env.on : $locale.env.off }}</template>

		<MkSwitch v-model="noCrawle">{{ $locale.env.noCrawle }}<template #caption>{{ $locale.env.noCrawleDescription }}</template></MkSwitch>
	</MkFolder>

	<MkFolder>
		<template #label>{{ $locale.env.preventAiLearning }}</template>
		<template #icon><i class="ti ti-photo-shield"></i></template>
		<template #suffix>{{ preventAiLearning ? $locale.env.on : $locale.env.off }}</template>

		<MkSwitch v-model="preventAiLearning">{{ $locale.env.preventAiLearning }}<template #caption>{{ $locale.env.preventAiLearningDescription }}</template></MkSwitch>
	</MkFolder>

	<MkInfo>{{ $locale.env._initialAccountSetting.youCanEditMoreSettingsInSettingsPageLater }}</MkInfo>
</div>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue';
import MkSwitch from '@/components/MkSwitch.vue';
import MkInfo from '@/components/MkInfo.vue';
import MkFolder from '@/components/MkFolder.vue';
import { misskeyApi } from '@/utility/misskey-api.js';

const isLocked = ref(false);
const hideOnlineStatus = ref(false);
const noCrawle = ref(false);
const preventAiLearning = ref(true);

watch([isLocked, hideOnlineStatus, noCrawle, preventAiLearning], () => {
	misskeyApi('i/update', {
		isLocked: !!isLocked.value,
		hideOnlineStatus: !!hideOnlineStatus.value,
		noCrawle: !!noCrawle.value,
		preventAiLearning: !!preventAiLearning.value,
	});
});
</script>

<style lang="scss" module>

</style>
