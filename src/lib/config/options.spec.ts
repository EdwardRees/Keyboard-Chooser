import { describe, it, expect } from 'vitest';
import { OPTIONS, FIELD_ORDER, emptySelections } from './options';

describe('OPTIONS', () => {
	it('lists the eight layouts in order', () => {
		expect(OPTIONS.layout.map((o) => o.id)).toEqual([
			'40',
			'60',
			'65',
			'75',
			'80',
			'98',
			'tkl',
			'100'
		]);
	});

	it('lists the five switch types in order', () => {
		expect(OPTIONS.switchType.map((o) => o.id)).toEqual([
			'linear',
			'tactile',
			'clicky',
			'silent-linear',
			'silent-tactile'
		]);
	});

	it('gives every option a label and a description', () => {
		for (const group of Object.values(OPTIONS)) {
			for (const o of group) {
				expect(o.label.length).toBeGreaterThan(0);
				expect(o.description.length).toBeGreaterThan(0);
			}
		}
	});

	it('gives every color option a hex value', () => {
		for (const o of [...OPTIONS.caseColor, ...OPTIONS.keycapColor]) {
			expect(o.hex).toMatch(/^#[0-9a-f]{6}$/i);
		}
	});

	it('offers "unsure" in every optional group', () => {
		const required = ['layout', 'switchType', 'caseColor', 'keycapColor'];
		for (const [name, group] of Object.entries(OPTIONS)) {
			const hasUnsure = group.some((o) => o.id === 'unsure');
			expect(hasUnsure).toBe(!required.includes(name));
		}
	});
});

describe('emptySelections', () => {
	it('leaves required fields null and defaults the rest to unsure', () => {
		const s = emptySelections();
		expect(s.layout).toBeNull();
		expect(s.switchType).toBeNull();
		expect(s.caseColor).toBeNull();
		expect(s.keycapColor).toBeNull();
		expect(s.hotSwap).toBe('unsure');
		expect(s.budget).toBe('unsure');
		expect(s.notes).toBe('');
		expect(s.keycapLink).toBe('');
		expect(s.keycapLook).toBe('');
	});

	it('has a FIELD_ORDER of 14 real keys', () => {
		expect(FIELD_ORDER).toHaveLength(14);
		for (const k of FIELD_ORDER) expect(emptySelections()).toHaveProperty(k);
	});
});
