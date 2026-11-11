<script lang="ts">
	import { getLayout } from '../layouts/layouts';
	import {
		OPTIONS,
		type Backlighting,
		type CaseColor,
		type KeycapColor,
		type Knob,
		type LayoutId
	} from '../config/options';

	interface Props {
		layout: LayoutId | null;
		caseColor: CaseColor | null;
		keycapColor: KeycapColor | null;
		knob: Knob;
		backlight: Backlighting;
	}

	let { layout, caseColor, keycapColor, knob, backlight }: Props = $props();

	const uid = $props.id();
	const PAD = 0.6;
	const KNOB_SPACE = 1.8;

	const geometry = $derived(layout ? getLayout(layout) : null);
	const caseFill = $derived(OPTIONS.caseColor.find((o) => o.id === caseColor)?.hex ?? '#9ca3af');
	const keyFill = $derived(OPTIONS.keycapColor.find((o) => o.id === keycapColor)?.hex ?? '#e5e7eb');
	const hasKnob = $derived(knob === 'yes');
	const hasGlow = $derived(backlight === 'white' || backlight === 'rgb');
	const extra = $derived(hasKnob ? KNOB_SPACE : 0);
</script>

{#if geometry}
	<svg
		viewBox="{-PAD} {-PAD} {geometry.width + PAD * 2 + extra} {geometry.height + PAD * 2}"
		class="h-auto w-full"
		role="img"
		aria-label="Preview of your {layout} keyboard"
	>
		<defs>
			<filter id="{uid}-blur" x="-20%" y="-20%" width="140%" height="140%">
				<feGaussianBlur stdDeviation="0.35" />
			</filter>
			<linearGradient id="{uid}-rgb" x1="0" x2="1" y1="0" y2="0">
				<stop offset="0%" stop-color="#ff4d6d" />
				<stop offset="25%" stop-color="#ffd93d" />
				<stop offset="50%" stop-color="#4ade80" />
				<stop offset="75%" stop-color="#38bdf8" />
				<stop offset="100%" stop-color="#c084fc" />
			</linearGradient>
		</defs>

		<rect
			data-testid="case"
			x={-PAD}
			y={-PAD}
			width={geometry.width + PAD * 2 + extra}
			height={geometry.height + PAD * 2}
			rx="0.6"
			fill={caseFill}
		/>

		{#if hasGlow}
			<rect
				data-testid="backlight"
				x="0"
				y="0"
				width={geometry.width}
				height={geometry.height}
				rx="0.3"
				fill={backlight === 'rgb' ? `url(#${uid}-rgb)` : '#fff3b0'}
				opacity="0.85"
				filter="url(#{uid}-blur)"
			/>
		{/if}

		{#each geometry.keys as key, i (i)}
			<rect
				data-testid="key"
				x={key.x + 0.06}
				y={key.y + 0.06}
				width={key.w - 0.12}
				height={key.h - 0.12}
				rx="0.14"
				fill={keyFill}
				stroke="rgba(0,0,0,0.25)"
				stroke-width="0.03"
			/>
		{/each}

		{#if hasKnob}
			<circle
				data-testid="knob"
				cx={geometry.width + 0.9}
				cy={0.7}
				r="0.6"
				fill="#d1d5db"
				stroke="rgba(0,0,0,0.35)"
				stroke-width="0.05"
			/>
		{/if}
	</svg>
{:else}
	<div
		class="flex aspect-[3/1] w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-300 text-gray-500"
	>
		Pick a layout to see your keyboard
	</div>
{/if}
