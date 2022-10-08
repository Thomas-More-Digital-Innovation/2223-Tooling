<script>
	import { page } from '$app/stores';

	function goBack() {
		history.back();
	}
</script>

<div class="hero min-h-full bg-base-200">
	<div class="hero-content text-left w-full">
		<div class="max-w-2xl">
			<h1 class="text-5xl font-bold">{$page.status} - {$page.error?.message}</h1>
			<p class="py-6">
				Whoopsiedaisy! It looks like something went wrong here... Please try again later!
			</p>
			<button class="btn btn-primary" on:click={goBack}>Go back</button>
		</div>
	</div>
</div>
