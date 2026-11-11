import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import './layout.css';
import Page from './+page.svelte';
import { exportConfig } from '../lib/config/serialize';
import type { CompleteSelections } from '../lib/config/options';

const imported: CompleteSelections = {
	layout: '65',
	switchType: 'tactile',
	caseColor: 'black',
	keycapColor: 'white',
	keycapProfile: 'cherry',
	keycapLink: '',
	keycapLook: '',
	caseMaterial: 'aluminum',
	hotSwap: 'yes',
	connectivity: 'wired',
	backlighting: 'rgb',
	knob: 'no',
	budget: '100-200',
	notes: 'Likes it quiet'
};

const next = () => page.getByRole('button', { name: 'Next' });

function previewKeys(container: HTMLElement) {
	return container.querySelectorAll('[data-testid="live-preview"] [data-testid="key"]');
}

describe('+page', () => {
	it('opens on the layout step with Next disabled', async () => {
		render(Page);
		await expect
			.element(page.getByRole('heading', { name: 'How big a keyboard do you want?' }))
			.toBeInTheDocument();
		await expect.element(next()).toBeDisabled();
	});

	it('enables Next and updates the live preview after choosing a layout', async () => {
		const { container } = render(Page);
		expect(previewKeys(container)).toHaveLength(0);
		await page.getByText('65%', { exact: true }).click();
		await expect.element(next()).toBeEnabled();
		expect(previewKeys(container)).toHaveLength(68);
	});

	it('disables progress steps beyond the furthest one reached', async () => {
		render(Page);
		await expect.element(page.getByRole('button', { name: 'Switches' })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Summary' })).toBeDisabled();
	});

	it('keeps earlier selections when going back', async () => {
		render(Page);
		await page.getByText('65%', { exact: true }).click();
		await next().click();
		await expect
			.element(page.getByRole('heading', { name: 'How should it feel to type?' }))
			.toBeInTheDocument();
		await page.getByRole('button', { name: 'Back' }).click();
		await expect
			.element(page.getByRole('button', { name: /65%/, pressed: true }))
			.toBeInTheDocument();
	});

	it('walks through every step to a summary with the download available', async () => {
		render(Page);
		await page.getByText('65%', { exact: true }).click();
		await next().click();
		await page.getByText('Tactile', { exact: true }).click();
		await next().click();
		await page.getByText('Black', { exact: true }).click();
		await next().click();
		await page.getByText('White', { exact: true }).click();
		await next().click(); // extras
		await next().click(); // summary
		await expect
			.element(page.getByRole('heading', { name: 'Your keyboard', exact: true }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Download JSON' })).toBeEnabled();
		expect(page.getByRole('button', { name: 'Next' }).elements()).toHaveLength(0);
	});
	it('lets the owner import a file from the very first step', async () => {
		const { container } = render(Page);
		const file = new File([exportConfig(imported)], 'client.json', { type: 'application/json' });
		await userEvent.upload(page.getByLabelText('Import JSON'), file);
		await expect
			.element(page.getByRole('heading', { name: 'Your keyboard', exact: true }))
			.toBeInTheDocument();
		expect(previewKeys(container)).toHaveLength(68);
	});

	it('lets the owner import a file from the middle of the wizard', async () => {
		render(Page);
		await page.getByText('40%', { exact: true }).click();
		await next().click();
		const file = new File([exportConfig(imported)], 'client.json', { type: 'application/json' });
		await userEvent.upload(page.getByLabelText('Import JSON'), file);
		await expect
			.element(page.getByRole('heading', { name: 'Your keyboard', exact: true }))
			.toBeInTheDocument();
	});

	it('shows only one import control on the summary step', async () => {
		render(Page);
		const file = new File([exportConfig(imported)], 'client.json', { type: 'application/json' });
		await userEvent.upload(page.getByLabelText('Import JSON'), file);
		await expect
			.element(page.getByRole('heading', { name: 'Your keyboard', exact: true }))
			.toBeInTheDocument();
		expect(page.getByLabelText('Import JSON').elements()).toHaveLength(1);
	});

	it('puts the preview beside the choices at tablet portrait width (800px)', async () => {
		await page.viewport(800, 1000);
		try {
			expect(window.innerWidth, 'viewport width actually applied').toBe(800);
			const { container } = render(Page);
			const preview = container.querySelector('[data-testid="live-preview"]') as HTMLElement;
			const heading = container.querySelector('h2') as HTMLElement;
			expect(preview.getBoundingClientRect().left).toBeGreaterThan(
				heading.getBoundingClientRect().right - 1
			);
			expect(getComputedStyle(preview).position).toBe('sticky');
		} finally {
			await page.viewport(414, 896);
		}
	});
});
