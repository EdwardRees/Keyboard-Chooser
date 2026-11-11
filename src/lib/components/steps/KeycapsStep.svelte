<script lang="ts">
	import OptionCard from '../OptionCard.svelte';
	import { OPTIONS } from '../../config/options';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();
</script>

<h2 class="text-2xl font-bold text-gray-900">Pick your keycaps</h2>
<p class="mt-1 mb-4 text-gray-600">Keycaps are the part your fingers touch.</p>

<h3 class="mb-2 text-lg font-semibold text-gray-900">Keycap color</h3>
<div class="mb-6 grid gap-3 sm:grid-cols-2">
	{#each OPTIONS.keycapColor as option (option.id)}
		<OptionCard
			label={option.label}
			description={option.description}
			swatch={option.hex}
			selected={wizard.selections.keycapColor === option.id}
			onselect={() => (wizard.selections.keycapColor = option.id)}
		/>
	{/each}
</div>

<h3 class="mb-2 text-lg font-semibold text-gray-900">Keycap profile</h3>
<p class="mb-2 text-sm text-gray-600">The shape and height of the keys.</p>
<div class="grid gap-3 sm:grid-cols-2">
	{#each OPTIONS.keycapProfile as option (option.id)}
		<OptionCard
			label={option.label}
			description={option.description}
			selected={wizard.selections.keycapProfile === option.id}
			onselect={() => (wizard.selections.keycapProfile = option.id)}
		/>
	{/each}
</div>
