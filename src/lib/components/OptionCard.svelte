<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label: string;
		description?: string;
		selected: boolean;
		onselect: () => void;
		swatch?: string;
		children?: Snippet;
	}

	let { label, description, selected, onselect, swatch, children }: Props = $props();
</script>

<button
	type="button"
	aria-pressed={selected}
	onclick={onselect}
	class="flex min-h-24 w-full flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 {selected
		? 'border-indigo-600 bg-indigo-50 shadow-md'
		: 'border-gray-200 bg-white hover:border-indigo-300'}"
>
	{#if children}
		<div class="w-full">{@render children()}</div>
	{/if}
	<span class="flex items-center gap-2 text-lg font-semibold text-gray-900">
		{#if swatch}
			<span
				class="inline-block size-6 rounded-full border border-black/20"
				style:background-color={swatch}
				aria-hidden="true"
			></span>
		{/if}
		{label}
	</span>
	{#if description}
		<span class="text-sm text-gray-600">{description}</span>
	{/if}
</button>
