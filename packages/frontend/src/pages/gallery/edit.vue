<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkSuspense v-slot="{ result }" :p="_fetch_">
	<XRoot :post="result"/>
</MkSuspense>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { ref } from 'vue';
import * as Misskey from 'misskey-js';
import XRoot from './edit.root.vue';
import { misskeyApi } from '@/utility/misskey-api.js';
import { definePage } from '@/page.js';

const props = defineProps<{
	postId?: string,
}>();

function _fetch_() {
	if (props.postId == null) {
		return Promise.resolve(null);
	} else {
		return misskeyApi('gallery/posts/show', {
			postId: props.postId,
		});
	}
}

definePage(() => ({
	title: props.postId ? localeRef.value.env.edit : localeRef.value.env.postToGallery,
	icon: 'ti ti-pencil',
}));
</script>
