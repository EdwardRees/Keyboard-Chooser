export type LayoutId = '40' | '60' | '65' | '75' | '80' | '98' | 'tkl' | '100';
export type SwitchType = 'linear' | 'tactile' | 'clicky' | 'silent-linear' | 'silent-tactile';
export type CaseColor = 'black' | 'white' | 'gray' | 'navy' | 'forest' | 'pink' | 'lavender';
export type KeycapColor = 'white' | 'black' | 'gray' | 'cream' | 'navy' | 'pink';
export type KeycapProfile = 'cherry' | 'oem' | 'sa' | 'low-profile' | 'unsure';
export type CaseMaterial = 'plastic' | 'aluminum' | 'unsure';
export type HotSwap = 'yes' | 'no' | 'unsure';
export type Connectivity = 'wired' | 'wireless' | 'unsure';
export type Backlighting = 'none' | 'white' | 'rgb' | 'unsure';
export type Knob = 'yes' | 'no' | 'unsure';
export type Budget = 'under-100' | '100-200' | '200-350' | '350-plus' | 'unsure';

export interface Option<T extends string> {
	id: T;
	label: string;
	description: string;
	hex?: string;
}

export interface CompleteSelections {
	layout: LayoutId;
	switchType: SwitchType;
	caseColor: CaseColor;
	keycapColor: KeycapColor;
	keycapProfile: KeycapProfile;
	/** A link to a keycap set the client likes. Empty, or an http(s) address. */
	keycapLink: string;
	/** The client's own description of the look they want. */
	keycapLook: string;
	caseMaterial: CaseMaterial;
	hotSwap: HotSwap;
	connectivity: Connectivity;
	backlighting: Backlighting;
	knob: Knob;
	budget: Budget;
	notes: string;
}

export type Selections = Omit<
	CompleteSelections,
	'layout' | 'switchType' | 'caseColor' | 'keycapColor'
> & {
	layout: LayoutId | null;
	switchType: SwitchType | null;
	caseColor: CaseColor | null;
	keycapColor: KeycapColor | null;
};

const unsure = {
	id: 'unsure',
	label: 'Not sure, you decide',
	description: 'Leave this one to me.'
} as const;

export const OPTIONS = {
	layout: [
		{
			id: '40',
			label: '40%',
			description: 'Tiny. Letters only, no number row. Maximum desk space.'
		},
		{ id: '60', label: '60%', description: 'Compact. No arrow keys, function row or number pad.' },
		{
			id: '65',
			label: '65%',
			description: 'Like a 60% but with arrow keys and a few extras. A popular sweet spot.'
		},
		{
			id: '75',
			label: '75%',
			description: 'Compact with a function row and arrows, all packed tightly together.'
		},
		{
			id: '80',
			label: '80%',
			description: 'Full function row, arrows and navigation keys, no number pad, no gaps.'
		},
		{
			id: '98',
			label: '98%',
			description: 'Almost everything, including a number pad, in a squeezed-in layout.'
		},
		{
			id: 'tkl',
			label: 'TKL',
			description:
				'Tenkeyless: a standard keyboard without the number pad, with gaps between key groups.'
		},
		{
			id: '100',
			label: '100% / Full',
			description: 'The classic full-size keyboard with a number pad.'
		}
	] satisfies Option<LayoutId>[],
	switchType: [
		{
			id: 'linear',
			label: 'Linear',
			description: 'Smooth and even all the way down, with no bump. Quiet and fast.'
		},
		{
			id: 'tactile',
			label: 'Tactile',
			description: 'A small bump you can feel on every press. Feels like a "normal" keyboard.'
		},
		{
			id: 'clicky',
			label: 'Clicky',
			description: 'A bump plus a loud, crisp click you can hear. Satisfying, but noisy.'
		},
		{
			id: 'silent-linear',
			label: 'Silent linear',
			description: 'Smooth like linear, with the sound dampened for shared spaces.'
		},
		{
			id: 'silent-tactile',
			label: 'Silent tactile',
			description: 'A bump you can feel, with the sound dampened for shared spaces.'
		}
	] satisfies Option<SwitchType>[],
	caseColor: [
		{ id: 'black', label: 'Black', description: 'Classic and understated.', hex: '#1f1f23' },
		{ id: 'white', label: 'White', description: 'Clean and bright.', hex: '#f2f2f0' },
		{ id: 'gray', label: 'Gray', description: 'Neutral and modern.', hex: '#8b8d94' },
		{ id: 'navy', label: 'Navy', description: 'Deep and calm.', hex: '#1f3a5f' },
		{ id: 'forest', label: 'Forest green', description: 'Rich and earthy.', hex: '#2f5d46' },
		{ id: 'pink', label: 'Pink', description: 'Soft and playful.', hex: '#f0a6c0' },
		{ id: 'lavender', label: 'Lavender', description: 'Light and pastel.', hex: '#b9a6e0' }
	] satisfies Option<CaseColor>[],
	keycapColor: [
		{ id: 'white', label: 'White', description: 'Bright and clean.', hex: '#fafafa' },
		{ id: 'black', label: 'Black', description: 'Classic.', hex: '#2a2a2e' },
		{ id: 'gray', label: 'Gray', description: 'Subtle and neutral.', hex: '#a0a2a8' },
		{ id: 'cream', label: 'Cream', description: 'Warm, retro look.', hex: '#efe4c8' },
		{ id: 'navy', label: 'Navy', description: 'Deep and calm.', hex: '#2c4a78' },
		{ id: 'pink', label: 'Pink', description: 'Soft and playful.', hex: '#f4b7cc' }
	] satisfies Option<KeycapColor>[],
	keycapProfile: [
		{
			id: 'cherry',
			label: 'Cherry',
			description: 'Low and gently rounded. Comfortable for most people.'
		},
		{ id: 'oem', label: 'OEM', description: 'Slightly taller, like most store-bought keyboards.' },
		{ id: 'sa', label: 'SA', description: 'Tall and sculpted with a retro typewriter feel.' },
		{
			id: 'low-profile',
			label: 'Low profile',
			description: 'Flat and slim, like a laptop keyboard.'
		},
		unsure
	] satisfies Option<KeycapProfile>[],
	caseMaterial: [
		{ id: 'plastic', label: 'Plastic', description: 'Lighter and more affordable.' },
		{
			id: 'aluminum',
			label: 'Aluminum',
			description: 'Heavier, sturdier and a more premium feel.'
		},
		unsure
	] satisfies Option<CaseMaterial>[],
	hotSwap: [
		{
			id: 'yes',
			label: 'Yes',
			description: 'Switches pop in and out, so you can try different ones later without soldering.'
		},
		{
			id: 'no',
			label: 'No',
			description: 'Switches are soldered in place. Slightly sturdier, but harder to change.'
		},
		unsure
	] satisfies Option<HotSwap>[],
	connectivity: [
		{ id: 'wired', label: 'Wired', description: 'A USB cable. Always on, no charging.' },
		{
			id: 'wireless',
			label: 'Wireless',
			description: 'Bluetooth or a dongle. No cable on your desk, but needs charging.'
		},
		unsure
	] satisfies Option<Connectivity>[],
	backlighting: [
		{ id: 'none', label: 'None', description: 'No lights.' },
		{ id: 'white', label: 'White', description: 'Simple white glow under the keys.' },
		{ id: 'rgb', label: 'RGB', description: 'Any color, with lighting effects.' },
		unsure
	] satisfies Option<Backlighting>[],
	knob: [
		{ id: 'yes', label: 'Yes', description: 'A dial in the corner, usually for volume.' },
		{ id: 'no', label: 'No', description: 'Keys only.' },
		unsure
	] satisfies Option<Knob>[],
	budget: [
		{ id: 'under-100', label: 'Under $100', description: 'Entry level.' },
		{ id: '100-200', label: '$100 – $200', description: 'Solid mid-range.' },
		{ id: '200-350', label: '$200 – $350', description: 'Enthusiast quality.' },
		{ id: '350-plus', label: '$350+', description: 'Premium, no compromises.' },
		unsure
	] satisfies Option<Budget>[]
} as const;

export const FIELD_ORDER: (keyof CompleteSelections)[] = [
	'layout',
	'switchType',
	'caseColor',
	'keycapColor',
	'keycapProfile',
	'keycapLink',
	'keycapLook',
	'caseMaterial',
	'hotSwap',
	'connectivity',
	'backlighting',
	'knob',
	'budget',
	'notes'
];

export function emptySelections(): Selections {
	return {
		layout: null,
		switchType: null,
		caseColor: null,
		keycapColor: null,
		keycapProfile: 'unsure',
		keycapLink: '',
		keycapLook: '',
		caseMaterial: 'unsure',
		hotSwap: 'unsure',
		connectivity: 'unsure',
		backlighting: 'unsure',
		knob: 'unsure',
		budget: 'unsure',
		notes: ''
	};
}
