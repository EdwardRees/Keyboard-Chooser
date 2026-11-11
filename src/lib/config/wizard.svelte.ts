import { emptySelections, type CompleteSelections, type Selections } from './options';

export const STEPS = ['layout', 'switch', 'color', 'keycaps', 'extras', 'summary'] as const;

export class Wizard {
	selections: Selections = $state(emptySelections());
	step = $state(0);
	furthest = $state(0);

	get canAdvance(): boolean {
		switch (STEPS[this.step]) {
			case 'layout':
				return this.selections.layout !== null;
			case 'switch':
				return this.selections.switchType !== null;
			case 'color':
				return this.selections.caseColor !== null;
			case 'keycaps':
				return this.selections.keycapColor !== null;
			case 'extras':
				return true;
			default:
				return false;
		}
	}

	next(): void {
		if (!this.canAdvance) return;
		this.step += 1;
		if (this.step > this.furthest) this.furthest = this.step;
	}

	back(): void {
		if (this.step > 0) this.step -= 1;
	}

	goTo(index: number): void {
		if (!Number.isInteger(index) || index < 0 || index > this.furthest) return;
		this.step = index;
	}

	get complete(): CompleteSelections | null {
		const s = this.selections;
		if (
			s.layout === null ||
			s.switchType === null ||
			s.caseColor === null ||
			s.keycapColor === null
		) {
			return null;
		}
		return {
			...s,
			layout: s.layout,
			switchType: s.switchType,
			caseColor: s.caseColor,
			keycapColor: s.keycapColor
		};
	}

	importConfig(config: CompleteSelections): void {
		this.selections = { ...config };
		this.step = STEPS.length - 1;
		this.furthest = STEPS.length - 1;
	}
}
