/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable import/no-default-export */
import type { StoryObj } from '@storybook/vue3';
import { action } from 'storybook/actions';
import { expect, userEvent, within } from '@storybook/test';
import { file } from '../../.storybook/fakes.js';
import MkCwButton from './MkCwButton.vue';
import { useLocale, useLocalizer } from 'virtual:vite-vue-internationalization';

const localeRef = useLocale(import.meta.url);
const localizerRef = useLocalizer(import.meta.url);

export const Default = {
	render(args) {
		return {
			components: {
				MkCwButton,
			},
			data() {
				return {
					showContent: false,
				};
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
						'update:modelValue': action('update:modelValue'),
					};
				},
			},
			template: '<MkCwButton v-model="showContent" v-bind="props" v-on="events" />',
		};
	},
	args: {
		text: 'Some CW content',
	},
	async play({ canvasElement }) {
		const canvas = within(canvasElement);
		const buttonElement = canvas.getByRole<HTMLButtonElement>('button');
		await expect(buttonElement).toHaveTextContent(localeRef.value.env._cw.show);
		await expect(buttonElement).toHaveTextContent(localizerRef.value.env._cw.chars({ count: 15 }));
		await userEvent.click(buttonElement);
		await expect(buttonElement).toHaveTextContent(localeRef.value.env._cw.hide);
		await userEvent.click(buttonElement);
	},
	parameters: {
		chromatic: {
			// NOTE: テストが終わるまで待つ
			delay: 5000,
		},
		layout: 'centered',
	},
} satisfies StoryObj<typeof MkCwButton>;
export const IncludesTextAndDriveFile = {
	...Default,
	args: {
		text: 'Some CW content',
		files: [file()],
	},
	async play({ canvasElement }) {
		const canvas = within(canvasElement);
		const buttonElement = canvas.getByRole<HTMLButtonElement>('button');
		await expect(buttonElement).toHaveTextContent(localizerRef.value.env._cw.chars({ count: 15 }));
		await expect(buttonElement).toHaveTextContent(' / ');
		await expect(buttonElement).toHaveTextContent(localizerRef.value.env._cw.files({ count: 1 }));
	},
} satisfies StoryObj<typeof MkCwButton>;
