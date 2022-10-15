<script lang="ts">
	import { settingStore } from '$lib/settingStore';

	let gitHubPersonalAccessToken = $settingStore.GitHubPersonalAccessToken || '';
	let showGitHubPersonalAccessToken = false;

	function saveSettings(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();

		settingStore.update((updater) => {
			updater.GitHubPersonalAccessToken = gitHubPersonalAccessToken;
			return updater;
		});
	}

	function setGitHubPersonalAccessToken(event: any) {
		gitHubPersonalAccessToken = event.target.value;
	}
</script>

<div class="grow">
	<div class="py-4 px-8 max-w-2xl mx-auto">
		<h1 class="text-2xl font-bold">Settings</h1>
		<form class="flex flex-col gap-4" on:submit={saveSettings}>
			<div class="form-control w-full">
				<label for="gitHubPersonalAccessToken" class="label">
					<span class="label-text">What is your GitHub Personal Access Token?</span>
				</label>
				<label class="input-group">
					<input
						type={showGitHubPersonalAccessToken ? 'text' : 'password'}
						id="gitHubPersonalAccessToken"
						placeholder="Type here"
						class="input input-bordered w-full"
						value={gitHubPersonalAccessToken}
						on:input={setGitHubPersonalAccessToken}
					/>
					<button
						class="btn btn-primary"
						on:click={() => (showGitHubPersonalAccessToken = !showGitHubPersonalAccessToken)}
					>
						{#if showGitHubPersonalAccessToken}
							Hide
						{:else}
							Show
						{/if}
					</button>
				</label>
			</div>
			<button type="submit" class="btn btn-primary">Save</button>
		</form>
	</div>
</div>
