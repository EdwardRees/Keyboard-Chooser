<script lang="ts">
	import { Wizard, STEPS } from '../lib/config/wizard.svelte';
	import ProgressBar from '../lib/components/ProgressBar.svelte';
	import ImportButton from '../lib/components/ImportButton.svelte';
	import KeyboardPreview from '../lib/components/KeyboardPreview.svelte';
	import LayoutStep from '../lib/components/steps/LayoutStep.svelte';
	import SwitchStep from '../lib/components/steps/SwitchStep.svelte';
	import ColorStep from '../lib/components/steps/ColorStep.svelte';
	import KeycapsStep from '../lib/components/steps/KeycapsStep.svelte';
	import ExtrasStep from '../lib/components/steps/ExtrasStep.svelte';
	import SummaryStep from '../lib/components/steps/SummaryStep.svelte';

	const wizard = new Wizard();

	const stepLabels = ['Layout', 'Switches', 'Board color', 'Keycaps', 'Extras', 'Summary'];
	const current = $derived(STEPS[wizard.step]);
	const isLast = $derived(wizard.step === STEPS.length - 1);
</script>

<svelte:head>
	<title>Build your keyboard</title>
</svelte:head>

<main class="mx-auto max-w-6xl px-4 py-6">
	<header class="mb-6">
		<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
			<h1 class="text-3xl font-bold text-gray-900">Build your keyboard</h1>
			{#if !isLast}
				<ImportButton {wizard} />
			{/if}
		</div>
		<ProgressBar
			steps={stepLabels}
			current={wizard.step}
			furthest={wizard.furthest}
			ongoto={(i) => wizard.goTo(i)}
		/>
	</header>

	<div class="grid gap-8 md:grid-cols-2">
		<div
			data-testid="live-preview"
			class="order-first self-start rounded-2xl bg-gray-100 p-4 md:sticky md:top-6 md:order-last"
		>
			<KeyboardPreview
				layout={wizard.selections.layout}
				caseColor={wizard.selections.caseColor}
				keycapColor={wizard.selections.keycapColor}
				knob={wizard.selections.knob}
				backlight={wizard.selections.backlighting}
			/>
		</div>

		<div>
			{#if current === 'layout'}
				<LayoutStep {wizard} />
			{:else if current === 'switch'}
				<SwitchStep {wizard} />
			{:else if current === 'color'}
				<ColorStep {wizard} />
			{:else if current === 'keycaps'}
				<KeycapsStep {wizard} />
			{:else if current === 'extras'}
				<ExtrasStep {wizard} />
			{:else}
				<SummaryStep {wizard} />
			{/if}

			<div class="mt-8 flex justify-between">
				{#if wizard.step > 0}
					<button
						type="button"
						onclick={() => wizard.back()}
						class="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
					>
						Back
					</button>
				{:else}
					<span></span>
				{/if}
				{#if !isLast}
					<button
						type="button"
						onclick={() => wizard.next()}
						disabled={!wizard.canAdvance}
						class="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
					>
						Next
					</button>
				{/if}
			</div>
		</div>
	</div>
</main>
