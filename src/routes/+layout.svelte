<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/logo.svg" />
	<title>Aura Weather</title>
</svelte:head>

<div class="min-h-screen flex flex-col antialiased">
	<main class="flex-grow w-full max-w-4xl mx-auto px-4 py-6 md:py-10">
		{@render children()}
	</main>
</div>
