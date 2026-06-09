<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :showHeader="widgetProps.showHeader" class="mkw-chat">
	<template #icon><i class="ti ti-users"></i></template>
	<template #header>{{ $locale.env._widgets.chat }}</template>
	<template #func="{ buttonStyleClass }"><button class="_button" :class="buttonStyleClass" @click="configure()"><i class="ti ti-settings"></i></button></template>

	<div>
		<MkChatHistories/>
	</div>
</MkContainer>
</template>

<script lang="ts" setup>
import { useLocale } from 'virtual:vite-vue-internationalization';

import { } from 'vue';
import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { FormWithDefault, GetFormResultType } from '@/utility/form.js';
import MkContainer from '@/components/MkContainer.vue';
import MkChatHistories from '@/components/MkChatHistories.vue';
const localeRef = useLocale(import.meta.url);

const name = 'chat';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean',
		label: localeRef.value.env._widgetOptions.showHeader,
		default: true,
	},
} satisfies FormWithDefault;

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure, save } = useWidgetPropsManager(name,
	widgetPropsDef,
	props,
	emit,
);

defineExpose<WidgetComponentExpose>({
	name,
	configure,
	id: props.widget ? props.widget.id : null,
});
</script>
