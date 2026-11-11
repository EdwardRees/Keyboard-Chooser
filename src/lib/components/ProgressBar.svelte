<script lang="ts">
	interface Props {
		steps: readonly string[];
		current: number;
		furthest: number;
		ongoto: (index: number) => void;
	}

	let { steps, current, furthest, ongoto }: Props = $props();
</script>

<nav aria-label="Progress">
	<ol class="flex gap-2">
		{#each steps as label, i (i)}
			<li class="flex-1">
				<button
					type="button"
					disabled={i > furthest}
					aria-current={i === current ? 'step' : undefined}
					onclick={() => ongoto(i)}
					class="w-full border-t-4 pt-2 text-left text-sm font-medium transition disabled:cursor-not-allowed {i ===
					current
						? 'border-indigo-600 text-indigo-700'
						: i <= furthest
							? 'border-indigo-300 text-gray-700 hover:border-indigo-500'
							: 'border-gray-200 text-gray-400'}"
				>
					{label}
				</button>
			</li>
		{/each}
	</ol>
</nav>
