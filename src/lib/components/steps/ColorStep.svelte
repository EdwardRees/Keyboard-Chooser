<script lang="ts">
	import OptionCard from '../OptionCard.svelte';
	import { OPTIONS } from '../../config/options';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();
</script>

<h2 class="text-2xl font-bold text-gray-900">What color should the board be?</h2>
<p class="mt-1 mb-4 text-gray-600">
	This is the case that holds everything. Watch the preview change.
</p>

<div class="grid gap-3 sm:grid-cols-2">
	{#each OPTIONS.caseColor as option (option.id)}
		<OptionCard
			label={option.label}
			description={option.description}
			swatch={option.hex}
			selected={wizard.selections.caseColor === option.id}
			onselect={() => (wizard.selections.caseColor = option.id)}
		/>
	{/each}
</div>
