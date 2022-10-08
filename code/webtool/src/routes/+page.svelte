<script>
	import { drawerState } from './+layout.svelte';
</script>

<div class="hero min-h-full bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-xl">
			<h1 class="text-5xl font-bold">Digital Innovation Tools</h1>
			<p class="py-6">Tools to easily create GitHub repositories, teams and projects.</p>
			<button class="btn btn-primary drawer-button" on:click={() => drawerState.set(true)}
				>Open tools</button
			>
		</div>
	</div>
</div>
