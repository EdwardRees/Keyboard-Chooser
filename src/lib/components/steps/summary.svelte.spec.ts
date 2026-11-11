import { page, userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Wizard } from '../../config/wizard.svelte';
import { exportConfig } from '../../config/serialize';
import type { CompleteSelections } from '../../config/options';
import ExtrasStep from './ExtrasStep.svelte';
import SummaryStep from './SummaryStep.svelte';

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
	knob: 'unsure',
	budget: '100-200',
	notes: 'Likes it quiet'
};

function summaryWizard() {
	const wizard = new Wizard();
	wizard.importConfig(sample);
	return wizard;
}

describe('ExtrasStep', () => {
	it('selects the clicked option', async () => {
		const wizard = new Wizard();
		render(ExtrasStep, { wizard });
		await page.getByText('Aluminum', { exact: true }).click();
		expect(wizard.selections.caseMaterial).toBe('aluminum');
	});
});

describe('SummaryStep', () => {
	it('lists the chosen layout and flags "unsure" rows for the owner', async () => {
		render(SummaryStep, { wizard: summaryWizard() });
		await expect.element(page.getByText('65%', { exact: true })).toBeInTheDocument();
		await expect.element(page.getByText('Owner decides', { exact: true })).toBeInTheDocument();
	});

	it('writes typed notes to the wizard', async () => {
		const wizard = summaryWizard();
		render(SummaryStep, { wizard });
		await page.getByLabelText('Notes').fill('Wants a blue knob');
		expect(wizard.selections.notes).toBe('Wants a blue knob');
	});

	it('downloads keyboard-config.json containing exactly the exported config', async () => {
		const wizard = summaryWizard();
		const save = vi.fn();
		render(SummaryStep, { wizard, save });
		await page.getByRole('button', { name: 'Download JSON' }).click();
		expect(save).toHaveBeenCalledWith('keyboard-config.json', exportConfig(sample));
	});

	it('disables the download when required choices are missing', async () => {
		const wizard = new Wizard();
		render(SummaryStep, { wizard });
		await expect.element(page.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
	});

	it('imports a valid file into the wizard', async () => {
		const wizard = new Wizard();
		render(SummaryStep, { wizard });
		const file = new File([exportConfig(sample)], 'mine.json', { type: 'application/json' });
		await userEvent.upload(page.getByLabelText('Import JSON'), file);
		await vi.waitFor(() => expect(wizard.selections).toEqual(sample));
	});

	it('rejects a file with an unknown option value, shows an alert, and changes nothing', async () => {
		const wizard = summaryWizard();
		render(SummaryStep, { wizard });
		const bad = JSON.stringify({ version: 1, ...sample, layout: '42' });
		const file = new File([bad], 'bad.json', { type: 'application/json' });
		await userEvent.upload(page.getByLabelText('Import JSON'), file);
		await expect.element(page.getByRole('alert')).toBeInTheDocument();
		expect(wizard.selections).toEqual(sample);
	});
});
