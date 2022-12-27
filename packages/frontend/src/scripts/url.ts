export function query(obj: Record<string, any>): string {
	const params = Object.entries(obj)
		.filter(([, v]) => Array.isArray(v) ? v.length : v !== undefined)
		.reduce((a, [k, v]) => (a[k] = v, a), {} as Record<string, any>);

	return Object.entries(params)
		.map((p) => `${p[0]}=${encodeURIComponent(p[1])}`)
		.join('&');
}

export function appendQuery(url: string, queryStr: string): string {
	const urlc = new URL(url);
	urlc.searchParams.append(queryStr, queryStr);
	return urlc.toString();
}
