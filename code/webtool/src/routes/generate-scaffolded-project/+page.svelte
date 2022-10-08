<script lang="ts">
	import { settingStore } from '$lib/settingStore';

	function processData(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();
	}
</script>

<div class="grow">
	<div class="py-4 px-8 max-w-md">
		<h1 class="text-2xl font-bold">Generate scaffolded project</h1>
		<form class="flex flex-col gap-4" on:submit={processData}>
			<button type="submit" class="btn btn-primary max-w-md">Save</button>
		</form>
	</div>
</div>
