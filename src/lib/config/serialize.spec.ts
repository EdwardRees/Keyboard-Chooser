import { describe, it, expect } from 'vitest';
import { exportConfig, parseConfig } from './serialize';
import { FIELD_ORDER, type CompleteSelections } from './options';

const sample: CompleteSelections = {
	layout: '65',
	switchType: 'tactile',
	caseColor: 'black',
	keycapColor: 'white',
	keycapProfile: 'cherry',
	keycapLink: 'https://example.com/keycaps/set',
	keycapLook: 'cute pastel',
	caseMaterial: 'aluminum',
	hotSwap: 'yes',
	connectivity: 'wired',
	backlighting: 'rgb',
	knob: 'no',
	budget: '100-200',
	notes: 'Likes it quiet'
};

function valid(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({ version: 2, ...sample, ...overrides });
}

describe('exportConfig', () => {
	it('writes version first, then fields in FIELD_ORDER', () => {
		const parsed = JSON.parse(exportConfig(sample));
		expect(Object.keys(parsed)).toEqual(['version', ...FIELD_ORDER]);
		expect(parsed.version).toBe(2);
	});
});

describe('parseConfig', () => {
	it('round-trips to an identical selection and identical file', () => {
		const text = exportConfig(sample);
		const result = parseConfig(text);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.selections).toEqual(sample);
			expect(exportConfig(result.selections)).toBe(text);
		}
	});

	it('round-trips unicode, quotes and newlines in notes byte-identically', () => {
		const notes = 'Café ☕ "quoted"\nline two 🎹';
		const text = exportConfig({ ...sample, notes });
		const result = parseConfig(text);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.selections.notes).toBe(notes);
			expect(exportConfig(result.selections)).toBe(text);
		}
	});

	it.each([
		['empty text', ''],
		['not json', 'not json'],
		['null', 'null'],
		['an array', '[]'],
		['a missing field', JSON.stringify({ version: 1, layout: '65' })],
		['an extra top-level key', valid({ extra: 1 })],
		['a __proto__ key', '{"__proto__": {}, "version": 1}'],
		['notes that are not a string', valid({ notes: 5 })]
	])('rejects %s', (_name, text) => {
		const result = parseConfig(text);
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
	});

	it('rejects a newer version and mentions version', () => {
		const result = parseConfig(valid({ version: 3 }));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toMatch(/version/i);
	});

	it('rejects a missing version', () => {
		const { version: _v, ...rest } = JSON.parse(valid());
		const result = parseConfig(JSON.stringify(rest));
		expect(result.ok).toBe(false);
	});

	it('rejects an unknown option value and names the field', () => {
		const result = parseConfig(valid({ layout: '42' }));
		expect(result.ok).toBe(false);
		if (!result.ok) expect(result.error).toContain('layout');
	});
	describe('keycap link and look', () => {
		it('round-trips an empty link and look', () => {
			const blank = { ...sample, keycapLink: '', keycapLook: '' };
			const text = exportConfig(blank);
			const result = parseConfig(text);
			expect(result.ok).toBe(true);
			if (result.ok) expect(exportConfig(result.selections)).toBe(text);
		});

		it.each([
			['a javascript: link', 'javascript:alert(1)'],
			['an ftp link', 'ftp://example.com/x'],
			['plain text', 'cute keycaps'],
			['a non-string', 5]
		])('rejects %s as keycapLink and names the field', (_name, value) => {
			const result = parseConfig(valid({ keycapLink: value }));
			expect(result.ok).toBe(false);
			if (!result.ok) expect(result.error).toContain('keycapLink');
		});

		it('rejects a non-string keycapLook', () => {
			const result = parseConfig(valid({ keycapLook: 5 }));
			expect(result.ok).toBe(false);
		});

		it('rejects a version 2 file that is missing the new fields', () => {
			const { keycapLink: _a, keycapLook: _b, ...rest } = JSON.parse(valid());
			expect(parseConfig(JSON.stringify(rest)).ok).toBe(false);
		});
	});

	describe('version 1 files', () => {
		function v1(overrides: Record<string, unknown> = {}): string {
			const { keycapLink: _a, keycapLook: _b, ...rest } = sample;
			return JSON.stringify({ version: 1, ...rest, ...overrides });
		}

		it('still import, with a blank link and look', () => {
			const result = parseConfig(v1());
			expect(result.ok).toBe(true);
			if (result.ok) {
				expect(result.selections.keycapLink).toBe('');
				expect(result.selections.keycapLook).toBe('');
				expect(result.selections.layout).toBe('65');
			}
		});

		it('are rejected if they carry the version 2 fields', () => {
			expect(parseConfig(v1({ keycapLink: 'https://example.com' })).ok).toBe(false);
		});

		it('are still checked for unknown option values', () => {
			expect(parseConfig(v1({ layout: '42' })).ok).toBe(false);
		});
	});
});
