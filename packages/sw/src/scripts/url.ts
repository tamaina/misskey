export function query(init: string | string[][] | Record<string, string> | URLSearchParams | undefined): string {
	const p = new URLSearchParams(init);
	return p.toString();
}

export function appendQuery(url: string, queryStr: string): string {
	const urlc = new URL(url);
	urlc.searchParams.append(queryStr, queryStr);
	return urlc.toString();
}
