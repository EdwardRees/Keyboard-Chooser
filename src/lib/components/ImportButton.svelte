<script lang="ts">
	import { parseConfig } from '../config/serialize';
	import type { Wizard } from '../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();

	let importError = $state<string | null>(null);

	async function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const result = parseConfig(await file.text());
		if (result.ok) {
			importError = null;
			wizard.importConfig(result.selections);
		} else {
			importError = result.error;
		}
		input.value = ''; // allow importing the same file again
	}
</script>

<label
	class="inline-block cursor-pointer rounded-lg border-2 border-indigo-600 px-5 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
>
	Import JSON
	<input type="file" accept="application/json,.json" onchange={importFile} class="sr-only" />
</label>

{#if importError}
	<p role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-red-800">{importError}</p>
{/if}
