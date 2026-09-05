/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { set } from 'idb-keyval';
import { respondToShare } from '../../../sw/src/scripts/share.js';

vi.mock('idb-keyval', () => ({ set: vi.fn() }));

function request(form: FormData) {
	return new Request('https://example.com/sw/share', { method: 'POST', body: form });
}

describe('PWA share target', () => {
	beforeEach(() => { vi.mocked(set).mockReset().mockResolvedValue(undefined); });

	test('persists file names and content before redirecting with text fields', async () => {
		const form = new FormData();
		form.append('files', new File(['image'], 'photo.png', { type: 'image/png' }));
		form.append('title', 'Shared title');
		form.append('text', 'Shared text');
		const response = await respondToShare(request(form));
		expect(response.status).toBe(303);
		const location = new URL(response.headers.get('location')!);
		expect(location.pathname).toBe('/share');
		expect(location.searchParams.get('text')).toBe('Shared text');
		expect(location.searchParams.has('files')).toBe(false);
		const [key, files] = vi.mocked(set).mock.calls[0];
		expect(key).toBe('share-files-temp');
		expect((files as File[])[0].name).toBe('photo.png');
		expect(await (files as File[])[0].text()).toBe('image');
	});

	test('does not redirect until IndexedDB finishes saving', async () => {
		let release!: () => void;
		vi.mocked(set).mockReturnValue(new Promise(resolve => { release = resolve; }));
		let redirected = false;
		const response = respondToShare(request(new FormData())).then(value => { redirected = true; return value; });
		await vi.waitFor(() => expect(set).toHaveBeenCalled());
		expect(redirected).toBe(false);
		release();
		expect((await response).status).toBe(303);
	});

	test.each([false, true])('clears old files when the new share has no valid files (invalid entry: %s)', async invalid => {
		const form = new FormData();
		if (invalid) form.append('files', 'not a file');
		await respondToShare(request(form));
		expect(set).toHaveBeenCalledWith('share-files-temp', []);
	});

	test('does not navigate after a failed save', async () => {
		const error = new Error('storage failed');
		vi.mocked(set).mockRejectedValue(error);
		await expect(respondToShare(request(new FormData()))).rejects.toBe(error);
	});

	test('ignores an empty file-input placeholder', async () => {
		const form = new FormData();
		form.append('files', new File([], ''));
		await respondToShare(request(form));
		expect(set).toHaveBeenCalledWith('share-files-temp', []);
	});
});
