<script lang="ts">
	import OptionCard from '../OptionCard.svelte';
	import { OPTIONS, type Option } from '../../config/options';
	import type { Wizard } from '../../config/wizard.svelte';

	let { wizard }: { wizard: Wizard } = $props();

	const groups = [
		{ field: 'caseMaterial', title: 'Case material', intro: 'What the body is made of.' },
		{
			field: 'hotSwap',
			title: 'Hot-swap sockets',
			intro: 'Lets you change switches later without soldering.'
		},
		{
			field: 'connectivity',
			title: 'Wired or wireless',
			intro: 'How it connects to your computer.'
		},
		{ field: 'backlighting', title: 'Backlighting', intro: 'Lights under the keys.' },
		{ field: 'knob', title: 'Volume knob', intro: 'A dial in the corner.' },
		{ field: 'budget', title: 'Budget', intro: 'A rough range helps me pick parts.' }
	] as const;

	function optionsFor(field: (typeof groups)[number]['field']): readonly Option<string>[] {
		return OPTIONS[field];
	}

	function pick(field: (typeof groups)[number]['field'], id: string) {
		(wizard.selections as Record<string, unknown>)[field] = id;
	}
</script>

<h2 class="text-2xl font-bold text-gray-900">A few extras</h2>
<p class="mt-1 mb-4 text-gray-600">
	Skip anything you're unsure about. "Not sure, you decide" is already selected.
</p>

{#each groups as group (group.field)}
	<section class="mb-6">
		<h3 class="text-lg font-semibold text-gray-900">{group.title}</h3>
		<p class="mb-2 text-sm text-gray-600">{group.intro}</p>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each optionsFor(group.field) as option (option.id)}
				<OptionCard
					label={option.label}
					description={option.description}
					selected={wizard.selections[group.field] === option.id}
					onselect={() => pick(group.field, option.id)}
				/>
			{/each}
		</div>
	</section>
{/each}
