import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ProgressBar from './ProgressBar.svelte';

const steps = ['Layout', 'Switches', 'Board color', 'Keycaps'];

describe('ProgressBar', () => {
	it('renders one button per step and disables steps beyond the furthest', async () => {
		render(ProgressBar, { steps, current: 1, furthest: 1, ongoto: () => {} });
		await expect.element(page.getByRole('button', { name: 'Layout' })).toBeEnabled();
		await expect.element(page.getByRole('button', { name: 'Switches' })).toBeEnabled();
		await expect.element(page.getByRole('button', { name: 'Board color' })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Keycaps' })).toBeDisabled();
	});

	it('marks the current step', async () => {
		render(ProgressBar, { steps, current: 1, furthest: 2, ongoto: () => {} });
		await expect
			.element(page.getByRole('button', { name: 'Switches' }))
			.toHaveAttribute('aria-current', 'step');
	});

	it('calls ongoto with the index of an enabled step', async () => {
		const ongoto = vi.fn();
		render(ProgressBar, { steps, current: 2, furthest: 2, ongoto });
		await page.getByRole('button', { name: 'Layout' }).click();
		expect(ongoto).toHaveBeenCalledWith(0);
	});

	it('does not call ongoto for a disabled step', async () => {
		const ongoto = vi.fn();
		render(ProgressBar, { steps, current: 0, furthest: 0, ongoto });
		await page.getByRole('button', { name: 'Keycaps' }).click({ force: true });
		expect(ongoto).not.toHaveBeenCalled();
	});
});
