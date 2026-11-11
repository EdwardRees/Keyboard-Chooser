import { describe, it, expect } from 'vitest';
import { exportConfig, parseConfig } from './serialize';
import { FIELD_ORDER, type CompleteSelections } from './options';

const sample: CompleteSelections = {
	layout: '65',
	switchType: 'tactile',
	caseColor: 'black',
	keycapColor: 'white',
	keycapProfile: 'cherry',
	caseMaterial: 'aluminum',
	hotSwap: 'yes',
	connectivity: 'wired',
	backlighting: 'rgb',
	knob: 'no',
	budget: '100-200',
	notes: 'Likes it quiet'
};

function valid(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({ version: 1, ...sample, ...overrides });
}

describe('exportConfig', () => {
	it('writes version first, then fields in FIELD_ORDER', () => {
		const parsed = JSON.parse(exportConfig(sample));
		expect(Object.keys(parsed)).toEqual(['version', ...FIELD_ORDER]);
		expect(parsed.version).toBe(1);
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
		const result = parseConfig(valid({ version: 2 }));
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
});
