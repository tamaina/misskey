import { url as instanceUrl } from '@/config';
import * as url from '@/scripts/url';

export function getCompressedImageUrl(baseUrl: string): string {
	const u = new URL(baseUrl);
	if (u.href.startsWith(`${instanceUrl}/proxy/`)) {
		u.pathname = `${u.pathname}/compressed.webp`;
		// もう既にproxyっぽそうだったらsearchParams付けるだけ
		u.searchParams.set('compressed', '1');
		return u.href;
	}
	const dummy = `${u.host}${u.pathname}/compressed.webp`;	// 拡張子がないとキャッシュしてくれないCDNがあるので
	return `${instanceUrl}/proxy/${dummy}?${url.query({
		url: u.href,
		compressed: '1'
	})}`;
}
