<script lang="ts">
	import OptionCard from '../OptionCard.svelte';
	import { OPTIONS } from '../../config/options';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();
</script>

<h2 class="text-2xl font-bold text-gray-900">How should it feel to type?</h2>
<p class="mt-1 mb-4 text-gray-600">
	The switch under each key decides the feel and the sound. Not sure? "Tactile" feels most like a
	typical keyboard.
</p>

<div class="grid gap-3 sm:grid-cols-2">
	{#each OPTIONS.switchType as option (option.id)}
		<OptionCard
			label={option.label}
			description={option.description}
			selected={wizard.selections.switchType === option.id}
			onselect={() => (wizard.selections.switchType = option.id)}
		/>
	{/each}
</div>
