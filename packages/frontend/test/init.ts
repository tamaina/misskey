/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import type { Ref } from 'vue';
import { markRaw, ref } from 'vue';
import { createInternationalization, setActiveInternationalization } from 'virtual:vite-vue-internationalization';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

const internationalization = markRaw(createInternationalization({
	initialLocale: 'en-US',
	fallbackLocale: 'ja-JP',
}));
setActiveInternationalization(internationalization);
await internationalization.ready;
await internationalization.loadLocale('ja-JP');

// XXX: misskey-js panics if WebSocket is not defined
vi.stubGlobal('WebSocket', class WebSocket extends EventTarget { static CLOSING = 2; });

export const preferState: Record<string, unknown> = {

	// なんかtestがうまいこと動かないのでここに書く
	dataSaver: {
		media: false,
		avatar: false,
		urlPreview: false,
		code: false,
	},

	mutingEmojis: [],
};

export let preferReactive: Record<string, Ref<unknown>> = {};

for (const key in preferState) {
	if (preferState[key] !== undefined) {
		preferReactive[key] = ref(preferState[key]);
	}
}

// XXX: store somehow becomes undefined in vitest?
vi.mock('@/preferences.js', () => {

	return {
		prefer: {
			s: preferState,
			r: preferReactive,
		},
	};
});

// Add mocks for Web Audio API
const AudioNodeMock = vi.fn(() => ({
	connect: vi.fn(() => ({ connect: vi.fn() })),
	start: vi.fn(),
}));

const GainNodeMock = vi.fn(() => ({
	gain: vi.fn(),
}));

const AudioContextMock = vi.fn(() => ({
	createBufferSource: vi.fn(() => new AudioNodeMock()),
	createGain: vi.fn(() => new GainNodeMock()),
	decodeAudioData: vi.fn(),
}));

vi.stubGlobal('AudioContext', AudioContextMock);
