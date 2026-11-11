/** True only for a full http:// or https:// web address. Everything else (javascript:, data:, file:, plain text) is refused. */
export function isWebAddress(text: string): boolean {
	try {
		const url = new URL(text.trim());
		return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== '';
	} catch {
		return false;
	}
}
