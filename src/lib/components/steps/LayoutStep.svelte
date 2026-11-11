<script lang="ts">
	import OptionCard from '../OptionCard.svelte';
	import KeyboardPreview from '../KeyboardPreview.svelte';
	import { OPTIONS } from '../../config/options';
	import { getLayout } from '../../layouts/layouts';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();

	// Draw each thumbnail at its true size relative to the widest layout, so sizes read as different.
	const widest = Math.max(...OPTIONS.layout.map((o) => getLayout(o.id).width));
	const share = (id: (typeof OPTIONS.layout)[number]['id']) => (getLayout(id).width / widest) * 100;
</script>

<h2 class="text-2xl font-bold text-gray-900">How big a keyboard do you want?</h2>
<p class="mt-1 mb-4 text-gray-600">
	Bigger boards have more keys but take more desk space. Pick the one that feels right.
</p>

<div class="grid gap-3 sm:grid-cols-2">
	{#each OPTIONS.layout as option (option.id)}
		<OptionCard
			label={option.label}
			description={option.description}
			selected={wizard.selections.layout === option.id}
			onselect={() => (wizard.selections.layout = option.id)}
		>
			<div style:width="{share(option.id)}%">
				<KeyboardPreview
					layout={option.id}
					caseColor={null}
					keycapColor={null}
					knob="unsure"
					backlight="unsure"
				/>
			</div>
		</OptionCard>
	{/each}
</div>
