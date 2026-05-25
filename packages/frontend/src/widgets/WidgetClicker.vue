<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkContainer :showHeader="widgetProps.showHeader" class="mkw-clicker">
	<template #icon><i class="ti ti-cookie"></i></template>
	<template #header>Clicker</template>
	<MkClickerGame/>
</MkContainer>
</template>

<script lang="ts" setup>
import { $locale as localeRef } from '@/i18n.js';

import { useWidgetPropsManager } from './widget.js';
import type { WidgetComponentEmits, WidgetComponentExpose, WidgetComponentProps } from './widget.js';
import type { FormWithDefault, GetFormResultType } from '@/utility/form.js';
import MkContainer from '@/components/MkContainer.vue';
import MkClickerGame from '@/components/MkClickerGame.vue';

const name = 'clicker';

const widgetPropsDef = {
	showHeader: {
		type: 'boolean',
		label: localeRef.value.env._widgetOptions.showHeader,
		default: false,
	},
} satisfies FormWithDefault;

type WidgetProps = GetFormResultType<typeof widgetPropsDef>;

const props = defineProps<WidgetComponentProps<WidgetProps>>();
const emit = defineEmits<WidgetComponentEmits<WidgetProps>>();

const { widgetProps, configure } = useWidgetPropsManager(name,
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
