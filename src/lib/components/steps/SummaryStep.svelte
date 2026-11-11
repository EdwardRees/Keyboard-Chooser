<script lang="ts">
	import { OPTIONS, type Option } from '../../config/options';
	import { exportConfig } from '../../config/serialize';
	import { isWebAddress } from '../../config/link';
	import { downloadText } from '../../download';
	import ImportButton from '../ImportButton.svelte';
	import type { Wizard } from '../../config/wizard.svelte';

	let {
		wizard,
		save = downloadText
	}: { wizard: Wizard; save?: (filename: string, text: string) => void } = $props();

	const rows = [
		{ field: 'layout', title: 'Layout' },
		{ field: 'switchType', title: 'Switch type' },
		{ field: 'caseColor', title: 'Board color' },
		{ field: 'keycapColor', title: 'Keycap color' },
		{ field: 'keycapProfile', title: 'Keycap profile' },
		{ field: 'caseMaterial', title: 'Case material' },
		{ field: 'hotSwap', title: 'Hot-swap' },
		{ field: 'connectivity', title: 'Wired or wireless' },
		{ field: 'backlighting', title: 'Backlighting' },
		{ field: 'knob', title: 'Volume knob' },
		{ field: 'budget', title: 'Budget' }
	] as const;

	function describe(field: (typeof rows)[number]['field']) {
		const id = wizard.selections[field];
		const options: readonly Option<string>[] = OPTIONS[field];
		return {
			label: options.find((o) => o.id === id)?.label ?? 'Not chosen yet',
			unsure: id === 'unsure'
		};
	}

	function download() {
		const config = wizard.complete;
		if (config) save('keyboard-config.json', exportConfig(config));
	}
</script>

<h2 class="text-2xl font-bold text-gray-900">Your keyboard</h2>
<p class="mt-1 mb-4 text-gray-600">
	Here's everything you picked. Anything marked "Owner decides" is left to me.
</p>

<dl class="mb-6 divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
	{#each rows as row (row.field)}
		{@const d = describe(row.field)}
		<div class="flex items-center justify-between gap-4 p-3">
			<dt class="text-gray-600">{row.title}</dt>
			<dd class="flex items-center gap-2 font-semibold text-gray-900">
				<span>{d.label}</span>
				{#if d.unsure}
					<span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
						Owner decides
					</span>
				{/if}
			</dd>
		</div>
	{/each}
	<div class="flex items-center justify-between gap-4 p-3">
		<dt class="text-gray-600">Keycap set link</dt>
		<dd class="min-w-0 font-semibold text-gray-900">
			{#if wizard.selections.keycapLink && isWebAddress(wizard.selections.keycapLink)}
				<a
					href={wizard.selections.keycapLink}
					target="_blank"
					rel="noopener noreferrer"
					class="break-all text-indigo-700 underline">{wizard.selections.keycapLink}</a
				>
			{:else}
				None
			{/if}
		</dd>
	</div>
	<div class="flex items-center justify-between gap-4 p-3">
		<dt class="text-gray-600">Look you want</dt>
		<dd class="font-semibold whitespace-pre-line text-gray-900">
			{wizard.selections.keycapLook || 'None'}
		</dd>
	</div>
</dl>

<label class="mb-6 block">
	<span class="mb-1 block text-lg font-semibold text-gray-900">Notes</span>
	<textarea
		bind:value={wizard.selections.notes}
		rows="4"
		class="w-full rounded-lg border-gray-300"
		placeholder="Anything else I should know?"></textarea>
</label>

<div class="flex flex-wrap items-center gap-3">
	<button
		type="button"
		onclick={download}
		disabled={wizard.complete === null}
		class="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
	>
		Download JSON
	</button>

	<ImportButton {wizard} />
</div>
