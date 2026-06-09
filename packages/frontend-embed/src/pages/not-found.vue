<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<div>
	<div class="_fullinfo">
		<div>{{ $locale.env.notFoundDescription }}</div>
	</div>
</div>
</template>

<script lang="ts" setup>
import { inject, computed } from 'vue';
import { DI } from '@/di.js';

const serverMetadata = inject(DI.serverMetadata)!;
</script>
