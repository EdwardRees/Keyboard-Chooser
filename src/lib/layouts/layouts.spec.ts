import { describe, it, expect } from 'vitest';
import { getLayout } from './layouts';
import { OPTIONS, type LayoutId } from '../config/options';

const ids = OPTIONS.layout.map((o) => o.id) as LayoutId[];

describe('getLayout key counts', () => {
	it.each([
		['60', 61],
		['65', 68],
		['75', 82],
		['80', 87],
		['tkl', 87],
		['98', 98],
		['100', 104]
	] as const)('%s has %i keys', (id, count) => {
		expect(getLayout(id).keys).toHaveLength(count);
	});

	it('40 has between 40 and 47 keys', () => {
		const n = getLayout('40').keys.length;
		expect(n).toBeGreaterThanOrEqual(40);
		expect(n).toBeLessThanOrEqual(47);
	});
});

describe('getLayout geometry', () => {
	it.each(ids)('%s: keys are positive-sized and inside the bounds', (id) => {
		const { keys, width, height } = getLayout(id);
		for (const k of keys) {
			expect(k.w).toBeGreaterThan(0);
			expect(k.h).toBeGreaterThan(0);
			expect(k.x).toBeGreaterThanOrEqual(0);
			expect(k.y).toBeGreaterThanOrEqual(0);
			expect(k.x + k.w).toBeLessThanOrEqual(width + 0.001);
			expect(k.y + k.h).toBeLessThanOrEqual(height + 0.001);
		}
	});

	it.each(ids)('%s: no two keys overlap', (id) => {
		const { keys } = getLayout(id);
		const e = 0.001;
		for (let i = 0; i < keys.length; i++) {
			for (let j = i + 1; j < keys.length; j++) {
				const a = keys[i];
				const b = keys[j];
				const overlaps =
					a.x < b.x + b.w - e && b.x < a.x + a.w - e && a.y < b.y + b.h - e && b.y < a.y + a.h - e;
				expect(overlaps, `${id}: keys ${i} and ${j} overlap`).toBe(false);
			}
		}
	});

	it('reports its own id', () => {
		for (const id of ids) expect(getLayout(id).id).toBe(id);
	});

	it('makes sizes read as different: TKL is wider than 80%, 100% wider than TKL', () => {
		expect(getLayout('tkl').width).toBeGreaterThan(getLayout('80').width);
		expect(getLayout('100').width).toBeGreaterThan(getLayout('tkl').width);
	});

	it('grows in height from 40 to 60 to 75', () => {
		expect(getLayout('40').height).toBeLessThan(getLayout('60').height);
		expect(getLayout('60').height).toBeLessThan(getLayout('75').height);
	});
});
