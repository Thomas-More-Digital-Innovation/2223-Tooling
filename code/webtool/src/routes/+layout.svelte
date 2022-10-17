<script context="module">
	import { writable } from 'svelte/store';

	export const drawerState = writable(false);
</script>

<script lang="ts">
	export const prerender = true;

	import '../app.css';
	import { page } from '$app/stores';
</script>

<div class="drawer">
	<input id="my-drawer" type="checkbox" class="drawer-toggle" checked={$drawerState} />
	<div class="drawer-content flex flex-col justify-between h-screen">
		{#if $page.routeId !== '' && $page.routeId !== null}
			<div class="navbar bg-base-100">
				<div class="flex-none">
					<button
						class="btn btn-square btn-ghost drawer-button"
						on:click={() => drawerState.set(true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							class="inline-block w-5 h-5 stroke-current"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/></svg
						>
					</button>
				</div>
				<div class="flex-1">
					<a class="btn btn-ghost normal-case text-xl" href="/">Digital Innovation Tools</a>
				</div>
			</div>
		{/if}
		<slot />
		<footer class="footer footer-center p-10 bg-primary text-primary-content">
			<div>
				<svg
					width="50"
					height="50"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 512 512"
					fill-rule="evenodd"
					clip-rule="evenodd"
					class="inline-block fill-current pb-2"
					><!--! Font Awesome Pro 6.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path
						d="M305.8 2.1C314.4 5.9 320 14.5 320 24V64h16c70.7 0 128 57.3 128 128V358.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V192c0-35.3-28.7-64-64-64H320v40c0 9.5-5.6 18.1-14.2 21.9s-18.8 2.3-25.8-4.1l-80-72c-5.1-4.6-7.9-11-7.9-17.8s2.9-13.3 7.9-17.8l80-72c7-6.3 17.2-7.9 25.8-4.1zM104 80c0-13.3-10.7-24-24-24S56 66.7 56 80s10.7 24 24 24s24-10.7 24-24zm8 73.3V358.7c28.3 12.3 48 40.5 48 73.3c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-32.8 19.7-61 48-73.3V153.3C19.7 141 0 112.8 0 80C0 35.8 35.8 0 80 0s80 35.8 80 80c0 32.8-19.7 61-48 73.3zM104 432c0-13.3-10.7-24-24-24s-24 10.7-24 24s10.7 24 24 24s24-10.7 24-24zm328 24c13.3 0 24-10.7 24-24s-10.7-24-24-24s-24 10.7-24 24s10.7 24 24 24z"
					/></svg
				>
				<p class="font-bold">
					jonasclaes.be<br />Providing reliable software since the 21st century
				</p>
				<p>Copyright © {new Date().getFullYear()} - All rights reserved</p>
			</div>
		</footer>
	</div>
	<div class="drawer-side">
		<div for="my-drawer" class="drawer-overlay" on:click={() => drawerState.set(false)} />
		<ul class="menu p-4 overflow-y-auto w-full sm:w-80 bg-base-100 text-base-content">
			<!-- Sidebar content here -->
			<li>
				<div class="flex flex-col justify-start items-start gap-0">
					<span>Thomas More</span>
					<span class="text-xl font-bold">Digital Innovation Tools</span>
				</div>
			</li>
			<li><a href="/" on:click={() => drawerState.set(false)}>Home</a></li>
			<li>
				<a href="/generate-scaffolded-project" on:click={() => drawerState.set(false)}
					>Generate scaffolded project</a
				>
			</li>
		</ul>
	</div>
</div>
