/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import { saveSharedFiles } from '@@/js/shared-files.js';
import { respondToShare } from '../../../sw/src/scripts/share.js';

vi.mock('@@/js/shared-files.js', () => ({ saveSharedFiles: vi.fn() }));
const shareId = '00000000-0000-4000-8000-000000000001';

function request(form: FormData) {
	return new Request('https://example.com/sw/share', { method: 'POST', body: form });
}

describe('PWA share target', () => {
	beforeEach(() => { vi.mocked(saveSharedFiles).mockReset().mockResolvedValue(shareId); });

	test('rejects a foreign web Origin without touching stored shares', async () => {
		const incoming = request(new FormData());
		// Origin is supplied by the browser, not by frontend Request constructors.
		vi.spyOn(incoming.headers, 'get').mockReturnValue('https://other.example');
		const response = await respondToShare(incoming);
		expect(response.status).toBe(403);
		expect(saveSharedFiles).not.toHaveBeenCalled();
	});

	test('does not accept a shareId supplied by the sender', async () => {
		const form = new FormData();
		form.append('shareId', 'untrusted');
		const response = await respondToShare(request(form));
		expect(new URL(response.headers.get('location')!).searchParams.get('shareId')).toBe(shareId);
	});

	test.each([null, 'null', 'https://example.com'])('accepts native or same-origin shares (Origin=%s)', async origin => {
		const incoming = request(new FormData());
		const getHeader = incoming.headers.get.bind(incoming.headers);
		vi.spyOn(incoming.headers, 'get').mockImplementation(name => name.toLowerCase() === 'origin' ? origin : getHeader(name));
		expect((await respondToShare(incoming)).status).toBe(303);
	});

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
		const [files] = vi.mocked(saveSharedFiles).mock.calls[0];
		expect(location.searchParams.get('shareId')).toBe(shareId);
		expect((files as File[])[0].name).toBe('photo.png');
		expect(await (files as File[])[0].text()).toBe('image');
	});

	test('does not redirect until IndexedDB finishes saving', async () => {
		let release!: () => void;
		vi.mocked(saveSharedFiles).mockReturnValue(new Promise(resolve => { release = () => resolve(shareId); }));
		let redirected = false;
		const response = respondToShare(request(new FormData())).then(value => { redirected = true; return value; });
		await vi.waitFor(() => expect(saveSharedFiles).toHaveBeenCalled());
		expect(redirected).toBe(false);
		release();
		expect((await response).status).toBe(303);
	});

	test.each([false, true])('stores an independent empty share when there are no valid files (invalid entry: %s)', async invalid => {
		const form = new FormData();
		if (invalid) form.append('files', 'not a file');
		await respondToShare(request(form));
		expect(saveSharedFiles).toHaveBeenCalledWith([]);
	});

	test('does not navigate after a failed save', async () => {
		const error = new Error('storage failed');
		vi.mocked(saveSharedFiles).mockRejectedValue(error);
		await expect(respondToShare(request(new FormData()))).rejects.toBe(error);
	});

	test('ignores an empty file-input placeholder', async () => {
		const form = new FormData();
		form.append('files', new File([], ''));
		await respondToShare(request(form));
		expect(saveSharedFiles).toHaveBeenCalledWith([]);
	});
});
