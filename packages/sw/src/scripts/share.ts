/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { set } from 'idb-keyval';

export async function respondToShare(request: Request): Promise<Response> {
	const responseUrl = new URL(request.url);
	responseUrl.pathname = '/share';
	const formData = await request.formData();
	const entries = formData.getAll('files');
	const files = entries.every(file => file instanceof Blob)
		? entries.filter(file => !(file instanceof File && file.name === '' && file.size === 0))
		: [];

	// Persist before navigation, including clearing attachments for text-only shares.
	await set('share-files-temp', files);
	formData.delete('files');
	for (const [key, value] of formData.entries()) {
		responseUrl.searchParams.set(key, value.toString());
	}

	return Response.redirect(responseUrl, 303);
}
