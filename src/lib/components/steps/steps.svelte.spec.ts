import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Wizard } from '../../config/wizard.svelte';
import LayoutStep from './LayoutStep.svelte';
import SwitchStep from './SwitchStep.svelte';
import ColorStep from './ColorStep.svelte';
import KeycapsStep from './KeycapsStep.svelte';

describe('LayoutStep', () => {
	it('shows eight layout cards and selects the clicked one', async () => {
		const wizard = new Wizard();
		const { container } = render(LayoutStep, { wizard });
		expect(container.querySelectorAll('button')).toHaveLength(8);
		await page.getByText('65%', { exact: true }).click();
		expect(wizard.selections.layout).toBe('65');
	});

	it('draws smaller layouts narrower so sizes read as different', async () => {
		const wizard = new Wizard();
		const { container } = render(LayoutStep, { wizard });
		const widths = [...container.querySelectorAll('button')].map(
			(b) => b.querySelector('svg')!.getBoundingClientRect().width
		);
		const [w40, w60, , , , , , w100] = widths;
		expect(w40 / w100).toBeLessThan(0.65);
		expect(w60 / w100).toBeLessThan(0.75);
	});

	it('marks the chosen layout as pressed', async () => {
		const wizard = new Wizard();
		wizard.selections.layout = 'tkl';
		const { container } = render(LayoutStep, { wizard });
		expect(container.querySelectorAll('button[aria-pressed="true"]')).toHaveLength(1);
	});
});

describe('SwitchStep', () => {
	it('shows five switch cards and selects the clicked one', async () => {
		const wizard = new Wizard();
		const { container } = render(SwitchStep, { wizard });
		expect(container.querySelectorAll('button')).toHaveLength(5);
		await page.getByText('Tactile', { exact: true }).click();
		expect(wizard.selections.switchType).toBe('tactile');
	});
});

describe('ColorStep', () => {
	it('selects the clicked board color', async () => {
		const wizard = new Wizard();
		render(ColorStep, { wizard });
		await page.getByText('Navy', { exact: true }).click();
		expect(wizard.selections.caseColor).toBe('navy');
	});
});

describe('KeycapsStep', () => {
	it('sets keycap color and profile independently, with profile starting on unsure', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		expect(wizard.selections.keycapProfile).toBe('unsure');
		await page.getByText('Cream', { exact: true }).click();
		expect(wizard.selections.keycapColor).toBe('cream');
		expect(wizard.selections.keycapProfile).toBe('unsure');
		await page.getByText('SA', { exact: true }).click();
		expect(wizard.selections.keycapProfile).toBe('sa');
		expect(wizard.selections.keycapColor).toBe('cream');
	});
	it('saves a valid keycap set link', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		await page.getByLabelText('Link to a keycap set you like').fill('https://example.com/set');
		expect(wizard.selections.keycapLink).toBe('https://example.com/set');
	});

	it('trims whitespace around the link', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		await page.getByLabelText('Link to a keycap set you like').fill('  https://example.com/set  ');
		expect(wizard.selections.keycapLink).toBe('https://example.com/set');
	});

	it('refuses an unsafe link, shows a message and saves nothing', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		await page.getByLabelText('Link to a keycap set you like').fill('javascript:alert(1)');
		await expect.element(page.getByRole('alert')).toHaveTextContent('starting with https://');
		expect(wizard.selections.keycapLink).toBe('');
	});

	it('clears the saved link and the message when the box is emptied', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		const box = page.getByLabelText('Link to a keycap set you like');
		await box.fill('https://example.com/set');
		await box.fill('nonsense');
		await box.fill('');
		expect(wizard.selections.keycapLink).toBe('');
		expect(page.getByRole('alert').elements()).toHaveLength(0);
	});

	it('shows a link that was imported earlier', async () => {
		const wizard = new Wizard();
		wizard.selections.keycapLink = 'https://example.com/set';
		render(KeycapsStep, { wizard });
		await expect
			.element(page.getByLabelText('Link to a keycap set you like'))
			.toHaveValue('https://example.com/set');
	});

	it('saves the description of the look', async () => {
		const wizard = new Wizard();
		render(KeycapsStep, { wizard });
		await page.getByLabelText('Describe the look you want').fill('cute and pastel');
		expect(wizard.selections.keycapLook).toBe('cute and pastel');
	});
});
