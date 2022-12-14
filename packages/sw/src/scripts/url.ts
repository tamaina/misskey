export function query(obj: object): string {
	const params = Object.entries(obj)
		.filter(([, v]) => Array.isArray(v) ? v.length : v !== undefined)
		.reduce((a, [k, v]) => (a[k] = v, a), {} as Record<string, any>);

	return Object.entries(params)
		.map((e) => `${e[0]}=${encodeURIComponent(e[1])}`)
		.join('&');
}

export function appendQuery(url: string, queryStr: string): string {
	const urlc = new URL(url);
	urlc.searchParams.append(queryStr, queryStr);
	return urlc.toString();
}
