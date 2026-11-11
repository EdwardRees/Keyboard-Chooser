import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import KeyboardPreview from './KeyboardPreview.svelte';
import { OPTIONS } from '../config/options';

const base = {
	layout: '60',
	caseColor: null,
	keycapColor: null,
	knob: 'unsure',
	backlight: 'unsure'
} as const;

describe('KeyboardPreview', () => {
	it('draws one key per layout key', async () => {
		const { container } = render(KeyboardPreview, { ...base });
		expect(container.querySelectorAll('[data-testid="key"]')).toHaveLength(61);
	});

	it('shows a placeholder and no keys when no layout is chosen', async () => {
		const { container } = render(KeyboardPreview, { ...base, layout: null });
		await expect.element(page.getByText('Pick a layout to see your keyboard')).toBeInTheDocument();
		expect(container.querySelectorAll('[data-testid="key"]')).toHaveLength(0);
	});

	it('colors the case from the chosen case color', async () => {
		const navy = OPTIONS.caseColor.find((o) => o.id === 'navy')!.hex;
		const { container } = render(KeyboardPreview, { ...base, caseColor: 'navy' });
		expect(container.querySelector('[data-testid="case"]')?.getAttribute('fill')).toBe(navy);
	});

	it('colors the keys from the chosen keycap color', async () => {
		const cream = OPTIONS.keycapColor.find((o) => o.id === 'cream')!.hex;
		const { container } = render(KeyboardPreview, { ...base, keycapColor: 'cream' });
		expect(container.querySelector('[data-testid="key"]')?.getAttribute('fill')).toBe(cream);
	});

	it.each([
		['yes', 1],
		['no', 0],
		['unsure', 0]
	] as const)('knob=%s draws %i knobs', async (knob, count) => {
		const { container } = render(KeyboardPreview, { ...base, knob });
		expect(container.querySelectorAll('[data-testid="knob"]')).toHaveLength(count);
	});

	it.each([
		['rgb', 1],
		['white', 1],
		['none', 0],
		['unsure', 0]
	] as const)('backlight=%s draws %i glows', async (backlight, count) => {
		const { container } = render(KeyboardPreview, { ...base, backlight });
		expect(container.querySelectorAll('[data-testid="backlight"]')).toHaveLength(count);
	});
});
