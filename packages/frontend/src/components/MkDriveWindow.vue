<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkWindow
	ref="window"
	:canResize="true"
	@closed="emit('closed')"
>
	<template #header>
		{{ $locale.env.drive }}
	</template>
	<MkDrive :initialFolder="initialFolder"/>
</MkWindow>
</template>

<script lang="ts" setup>

import { } from 'vue';
import * as Misskey from 'misskey-js';
import MkDrive from '@/components/MkDrive.vue';
import MkWindow from '@/components/MkWindow.vue';

defineProps<{
	initialFolder?: Misskey.entities.DriveFolder | null;
}>();

const emit = defineEmits<{
	(ev: 'closed'): void;
}>();
</script>
