import { describe, it, expect } from 'vitest';
import { Wizard } from './wizard.svelte';
import type { CompleteSelections } from './options';

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

function fillRequired(w: Wizard) {
	w.selections.layout = '65';
	w.selections.switchType = 'tactile';
	w.selections.caseColor = 'black';
	w.selections.keycapColor = 'white';
}

describe('Wizard', () => {
	it('blocks Next until the current step has its required choice', () => {
		const w = new Wizard();
		expect(w.step).toBe(0);
		expect(w.canAdvance).toBe(false);
		w.next();
		expect(w.step).toBe(0);
		w.selections.layout = '65';
		expect(w.canAdvance).toBe(true);
		w.next();
		expect(w.step).toBe(1);
	});

	it('lets the extras step advance with nothing touched and reaches a complete summary', () => {
		const w = new Wizard();
		fillRequired(w);
		w.next(); // switch
		w.next(); // color
		w.next(); // keycaps
		w.next(); // extras
		expect(w.step).toBe(4);
		expect(w.canAdvance).toBe(true);
		w.next();
		expect(w.step).toBe(5);
		expect(w.complete).not.toBeNull();
		expect(w.canAdvance).toBe(false);
	});

	it('only jumps back to visited steps', () => {
		const w = new Wizard();
		fillRequired(w);
		w.goTo(5);
		expect(w.step).toBe(0);
		w.next();
		w.next();
		w.next();
		expect(w.step).toBe(3);
		w.goTo(1);
		expect(w.step).toBe(1);
		w.goTo(4);
		expect(w.step).toBe(1);
		expect(w.furthest).toBe(3);
	});

	it('keeps later choices and the furthest step when an earlier choice changes', () => {
		const w = new Wizard();
		fillRequired(w);
		w.next();
		w.next();
		w.next();
		w.goTo(0);
		w.selections.layout = '75';
		expect(w.selections.switchType).toBe('tactile');
		expect(w.furthest).toBe(3);
	});

	it('goes back but not below the first step', () => {
		const w = new Wizard();
		w.back();
		expect(w.step).toBe(0);
	});

	it('is incomplete while a required field is missing', () => {
		const w = new Wizard();
		fillRequired(w);
		w.selections.caseColor = null;
		expect(w.complete).toBeNull();
	});

	it('importConfig replaces everything and lands on the summary, and is repeatable', () => {
		const w = new Wizard();
		w.selections.layout = '40';
		w.next();
		expect(w.step).toBe(1);
		w.importConfig(sample);
		expect(w.step).toBe(5);
		expect(w.furthest).toBe(5);
		expect(w.selections).toEqual(sample);
		w.importConfig(sample);
		expect(w.step).toBe(5);
		expect(w.selections).toEqual(sample);
	});

	it('importConfig copies the input so later edits do not change it', () => {
		const w = new Wizard();
		const input = { ...sample };
		w.importConfig(input);
		w.selections.notes = 'changed';
		expect(input.notes).toBe('Likes it quiet');
	});
});
