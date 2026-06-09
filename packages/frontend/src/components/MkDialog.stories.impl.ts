/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { action } from 'storybook/actions';
import { expect, userEvent, waitFor, within } from '@storybook/test';
import type { StoryObj } from '@storybook/vue3';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);
import MkDialog from './MkDialog.vue';
const Base = {
	render(args) {
		return {
			components: {
				MkDialog,
			},
			setup() {
				return {
					args,
				};
			},
			computed: {
				props() {
					return {
						...this.args,
					};
				},
				events() {
					return {
						done: action('done'),
						closed: action('closed'),
					};
				},
			},
			template: '<MkDialog v-bind="props" v-on="events" />',
		};
	},
	args: {
		text: 'Hello, world!',
	},
	parameters: {
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Success = {
	...Base,
	args: {
		...Base.args,
		type: 'success',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Error = {
	...Base,
	args: {
		...Base.args,
		type: 'error',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Warning = {
	...Base,
	args: {
		...Base.args,
		type: 'warning',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Info = {
	...Base,
	args: {
		...Base.args,
		type: 'info',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Question = {
	...Base,
	args: {
		...Base.args,
		type: 'question',
	},
} satisfies StoryObj<typeof MkDialog>;
export const Waiting = {
	...Base,
	args: {
		...Base.args,
		type: 'waiting',
	},
} satisfies StoryObj<typeof MkDialog>;
export const DialogWithActions = {
	...Question,
	args: {
		...Question.args,
		text: localeRef.value.env.areYouSure,
		actions: [
			{
				text: localeRef.value.env.yes,
				primary: true,
				callback() {
					action('YES')();
				},
			},
			{
				text: localeRef.value.env.no,
				callback() {
					action('NO')();
				},
			},
		],
	},
} satisfies StoryObj<typeof MkDialog>;
export const DialogWithDangerActions = {
	...Warning,
	args: {
		...Warning.args,
		text: localeRef.value.env.resetAreYouSure,
		actions: [
			{
				text: localeRef.value.env.yes,
				danger: true,
				primary: true,
				callback() {
					action('YES')();
				},
			},
			{
				text: localeRef.value.env.no,
				callback() {
					action('NO')();
				},
			},
		],
	},
} satisfies StoryObj<typeof MkDialog>;
export const DialogWithInput = {
	...Question,
	args: {
		...Question.args,
		title: 'Hello, world!',
		text: undefined,
		input: {
			placeholder: localeRef.value.env.inputMessageHere,
			type: 'text',
			default: null,
			minLength: 2,
			maxLength: 3,
		},
	},
	async play({ canvasElement }) {
		const canvas = within(canvasElement);
		await expect(canvasElement).toHaveTextContent(localizerRef.value.env._dialog.charactersBelow({ current: 0, min: 2 }));
		const okButton = canvas.getByRole('button', { name: localeRef.value.env.ok });
		await expect(okButton).toBeDisabled();
		const input = canvas.getByRole<HTMLInputElement>('combobox');
		await waitFor(() => userEvent.hover(input));
		await waitFor(() => userEvent.click(input));
		await waitFor(() => userEvent.type(input, 'M'));
		await expect(canvasElement).toHaveTextContent(localizerRef.value.env._dialog.charactersBelow({ current: 1, min: 2 }));
		await waitFor(() => userEvent.type(input, 'i'));
		await expect(okButton).toBeEnabled();
	},
} satisfies StoryObj<typeof MkDialog>;
