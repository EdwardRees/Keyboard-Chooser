import { describe, it, expect } from 'vitest';
import { isWebAddress } from './link';

describe('isWebAddress', () => {
	it.each([
		'https://example.com/keycaps/set',
		'http://example.com',
		'HTTPS://Example.com/Path?x=1#top'
	])('accepts %s', (text) => {
		expect(isWebAddress(text)).toBe(true);
	});

	it.each([
		'',
		'   ',
		'not a url',
		'example.com',
		'https://',
		'javascript:alert(1)',
		'data:text/html,<b>hi</b>',
		'ftp://example.com/file',
		'file:///etc/passwd'
	])('rejects %j', (text) => {
		expect(isWebAddress(text)).toBe(false);
	});
});
