import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import OptionCard from './OptionCard.svelte';

describe('OptionCard', () => {
	it('shows the label and description', async () => {
		render(OptionCard, {
			label: 'Tactile',
			description: 'A small bump.',
			selected: false,
			onselect: () => {}
		});
		await expect.element(page.getByText('Tactile')).toBeInTheDocument();
		await expect.element(page.getByText('A small bump.')).toBeInTheDocument();
	});

	it('calls onselect when clicked', async () => {
		const onselect = vi.fn();
		render(OptionCard, { label: 'Tactile', selected: false, onselect });
		await page.getByRole('button', { name: /Tactile/ }).click();
		expect(onselect).toHaveBeenCalledTimes(1);
	});

	it('is pressed only when selected', async () => {
		const { rerender } = render(OptionCard, {
			label: 'Tactile',
			selected: false,
			onselect: () => {}
		});
		await expect.element(page.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
		await rerender({ label: 'Tactile', selected: true, onselect: () => {} });
		await expect.element(page.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
	});
});
