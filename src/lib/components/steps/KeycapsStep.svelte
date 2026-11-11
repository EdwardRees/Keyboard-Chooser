<script lang="ts">
	import { untrack } from 'svelte';
	import { isWebAddress } from '../../config/link';
	import OptionCard from '../OptionCard.svelte';
	import { OPTIONS } from '../../config/options';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();

	// What the client has typed in the link box; only a valid web address is saved to the selections.
	let linkText = $state(untrack(() => wizard.selections.keycapLink));
	let linkInvalid = $state(false);

	function onLinkInput() {
		const text = linkText.trim();
		if (text === '') {
			wizard.selections.keycapLink = '';
			linkInvalid = false;
		} else if (isWebAddress(text)) {
			wizard.selections.keycapLink = text;
			linkInvalid = false;
		} else {
			wizard.selections.keycapLink = '';
			linkInvalid = true;
		}
	}
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

<h3 class="mt-6 mb-2 text-lg font-semibold text-gray-900">Already have a set in mind?</h3>
<p class="mb-3 text-sm text-gray-600">
	Both boxes are optional. They just help me understand what you like.
</p>

<label class="mb-4 block">
	<span class="mb-1 block font-medium text-gray-900">Link to a keycap set you like</span>
	<input
		type="text"
		inputmode="url"
		autocomplete="off"
		bind:value={linkText}
		oninput={onLinkInput}
		placeholder="https://"
		class="w-full rounded-lg border-gray-300"
	/>
</label>
{#if linkInvalid}
	<p role="alert" class="-mt-2 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
		Please enter a full web address starting with https://
	</p>
{/if}

<label class="block">
	<span class="mb-1 block font-medium text-gray-900">Describe the look you want</span>
	<textarea
		bind:value={wizard.selections.keycapLook}
		rows="3"
		class="w-full rounded-lg border-gray-300"
		placeholder="For example: cute, cool, soft pastels, retro..."></textarea>
</label>
