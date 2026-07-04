/**
	Cloudflare sends header values as raw bytes; Node's HTTP parser decodes them as latin1,
	so non-ASCII city/region names (e.g. "İzmir") arrive mojibaked and must be re-decoded as UTF-8.
 */
function fixEncoding(value: string | null): string | undefined {
	if (!value) return undefined;
	return Buffer.from(value, 'latin1').toString('utf8');
}

/**
	Extracts Cloudflare request/geo headers, deliberately omitting the visitor's raw IP.
	Location headers require the "Add visitor location headers" Managed Transform to be
	enabled on the Cloudflare zone; if it isn't, only `country` will be populated.
 */
export function getCfMeta(headers: Headers) {
	const cfRay = headers.get('cf-ray');
	if (!cfRay) return undefined;

	return {
		rayId: cfRay,
		country: headers.get('cf-ipcountry') || undefined,
		continent: fixEncoding(headers.get('cf-ipcontinent')),
		region: fixEncoding(headers.get('cf-region')),
		regionCode: headers.get('cf-region-code') || undefined,
		city: fixEncoding(headers.get('cf-ipcity')),
		postalCode: headers.get('cf-postal-code') || undefined,
		timezone: headers.get('cf-timezone') || undefined,
		latitude: headers.get('cf-iplatitude') || undefined,
		longitude: headers.get('cf-iplongitude') || undefined
	};
}
