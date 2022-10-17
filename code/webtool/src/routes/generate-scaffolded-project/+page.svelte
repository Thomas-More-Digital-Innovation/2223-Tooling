<script lang="ts">
	import type { RestEndpointMethodTypes } from '@octokit/rest';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import type { GenerateScaffoldedProjectData } from '../api/generate-scaffolded-project/+server';

	const organization = 'Thomas-More-Digital-Innovation';

	const gitHubOrganizationMembers = writable<RestEndpointMethodTypes["orgs"]["listMembers"]["response"]["data"]>([]);
	const gitHubOrganizationRepositories = writable<RestEndpointMethodTypes["repos"]["listForOrg"]["response"]["data"]>([]);
	$: gitHubOrganizationTemplateRepositories = $gitHubOrganizationRepositories.filter((repository) => repository.is_template);

	let step = 1;
	let loading = false;
	let success = false;
	let error: string | null = null;

	let inputAcademicYear = '';
	let inputProjectCode = '';
	let inputProjectSummary = '';
	let inputTemplate = 'None';
	let inputRepositoryPublic = false;
	let inputTeamMembers: { [key: string]: boolean } = {};

	$: yearCode = inputAcademicYear
		.split('-')
		.map((year) => year.slice(2))
		.reduce((x, y) => x + y);
	$: projectCodeSafe = inputProjectCode.replaceAll(' ', '-');
	$: projectSummarySafe = inputProjectSummary.replaceAll(' ', '-');
	$: repositoryName = [yearCode, projectCodeSafe, projectSummarySafe].join('-');
	$: repositoryDescription = `Project ${inputAcademicYear} ${projectCodeSafe}: ${inputProjectSummary}`;
	$: teamMembers = Object.entries(inputTeamMembers)
		.filter((entry) => entry[1])
		.map(entry => $gitHubOrganizationMembers.findIndex(member => member.login === entry[0]))
		.filter(member => member != -1)
		.map(v => $gitHubOrganizationMembers[v]);

	onMount(async () => {
		const getOrganizationMembersAndRepositoriesResponse = await fetch(
			'/api/get-organization-members-and-repositories'
		);

		if (getOrganizationMembersAndRepositoriesResponse.ok) {
			const getOrganizationMembersAndRepositoriesData =
				await getOrganizationMembersAndRepositoriesResponse.json();
			
			gitHubOrganizationMembers.set(getOrganizationMembersAndRepositoriesData.data.members);
			gitHubOrganizationRepositories.set(getOrganizationMembersAndRepositoriesData.data.repositories);
		}
	});

	function submitNext(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();
		step += 1;
	}

	async function submitReview(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();

		loading = true;

		try {
			const data: GenerateScaffoldedProjectData = {
				repositoryName,
				repositoryDescription,
				repositoryOrganization: organization,
				repositoryVisibility: inputRepositoryPublic ? 'public' : 'private',
				repostoryMembers: teamMembers.map((member) => member.login),
				repositoryTemplate: inputTemplate === 'None' ? undefined : inputTemplate
			};

			const response = await fetch('/api/generate-scaffolded-project', {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json'
				}
			});

			success = response.ok;
		} catch (err) {
			if (err instanceof Error) {
				error = err.message;
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="grow">
	<div class="py-4 px-8 max-w-2xl mx-auto flex flex-col gap-4">
		{#if success}
			<div class="alert alert-success shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<span>Your repository and team have been generated!</span>
				</div>
			</div>
		{/if}
		{#if error}
			<div class="alert alert-error shadow-lg">
				<div>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="stroke-current flex-shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						><path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/></svg
					>
					<span>Error! {error}</span>
				</div>
			</div>
		{/if}
		<h1 class="text-2xl font-bold">Generate scaffolded project</h1>
		<ul class="steps w-full">
			<li class="step step-primary">Project info</li>
			<li class="step {step >= 2 ? 'step-primary' : ''}">Set access</li>
			<li class="step {step >= 3 ? 'step-primary' : ''}">Review</li>
		</ul>
		{#if step == 1}
			<form on:submit={submitNext}>
				<div class="form-control w-full">
					<label class="label" for="academicYear">
						<span class="label-text">Academic year?</span>
					</label>
					<input
						type="text"
						id="academicYear"
						placeholder="Type here"
						class="input input-bordered w-full"
						bind:value={inputAcademicYear}
					/>
					<label class="label" for="academicYear">
						<span class="label-text-alt">Example: 2022-2023</span>
					</label>
				</div>
				<div class="form-control w-full">
					<label class="label" for="projectCode">
						<span class="label-text">Project code?</span>
					</label>
					<input
						type="text"
						id="projectCode"
						placeholder="Type here"
						class="input input-bordered w-full"
						bind:value={inputProjectCode}
					/>
					<label class="label" for="projectCode">
						<span class="label-text-alt">Project code from Excel sheet.</span>
						<span class="label-text-alt">Example: DI-001</span>
					</label>
				</div>
				<div class="form-control w-full">
					<label class="label" for="projectSummary">
						<span class="label-text">Project summary?</span>
					</label>
					<input
						type="text"
						id="projectSummary"
						placeholder="Type here"
						class="input input-bordered w-full"
						bind:value={inputProjectSummary}
					/>
					<label class="label" for="projectSummary">
						<span class="label-text-alt"
							>Enter a short project summary here. This will be used in the repo name as well as the
							description.</span
						>
					</label>
				</div>
				<div class="form-control w-full">
					<label class="label" for="templateRepository">
						<span class="label-text">Which template do you want to use?</span>
					</label>
					<select class="select select-bordered" id="templateRepository" bind:value={inputTemplate}>
						<option selected>None</option>
						{#each gitHubOrganizationTemplateRepositories as repo}
							<option>{repo.name}</option>
						{/each}
					</select>
					<label class="label" for="templateRepository">
						<span class="label-text-alt"
							>If no template was chosen, no template will be used and an empty repository will be
							created.</span
						>
					</label>
				</div>
				<div class="form-control">
					<label class="label cursor-pointer">
						<span class="label-text">{inputRepositoryPublic ? 'Public' : 'Private'} repository</span
						>
						<input type="checkbox" class="toggle" bind:checked={inputRepositoryPublic} />
					</label>
				</div>
				<div class="flex flex-col gap-2">
					<button type="submit" class="btn btn-primary">Next</button>
				</div>
			</form>
		{/if}
		{#if step == 2}
			<form on:submit={submitNext}>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<span class="label label-text col-span-full">Who should have access?</span>
					{#each $gitHubOrganizationMembers as member}
						<div class="form-control">
							<label class="label cursor-pointer">
								<div class="flex flex-row gap-4 items-center">
									<img src={member.avatar_url} alt={member.login} class="h-10" />
									<div class="flex flex-col justify-center">
										{#if member.name}
											<span>{member.name}</span>
										{/if}
										<a
											class="label-text"
											href={member.url}
											target="_blank"
											rel="noopener noreferrer">{member.login}</a
										>
									</div>
								</div>
								<input
									type="checkbox"
									class="toggle"
									bind:checked={inputTeamMembers[member.login || '']}
								/>
							</label>
						</div>
					{/each}
					<span class="label label-text-alt col-span-full"
						>Select the people that need access to this repository.</span
					>
				</div>
				<div class="flex flex-col gap-2">
					<button type="submit" class="btn btn-primary">Next</button>
					<button type="button" class="btn btn-ghost" on:click={() => (step -= 1)}>Back</button>
				</div>
			</form>
		{/if}
		{#if step == 3}
			<form on:submit={submitReview}>
				<div class="flex flex-col gap-2">
					<h2 class="text-lg font-bold">Is this information correct?</h2>
					<div>
						<span class="block font-bold">Repository name:</span>
						<span class="block">{repositoryName}</span>
					</div>
					<div>
						<span class="block font-bold">Repository description:</span>
						<span class="block">{repositoryDescription}</span>
					</div>
					<div>
						<span class="block font-bold">Repository template:</span>
						<span class="block">{inputTemplate}</span>
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<span class="block font-bold col-span-full">Repository access:</span>
						{#each teamMembers as member}
							<div class="flex flex-row gap-4 items-center">
								<img src={member.avatar_url} alt={member.login} class="h-10" />
								<a
									class="label-text"
									href={member.url}
									target="_blank"
									rel="noopener noreferrer">{member.login}</a
								>
							</div>
						{/each}
					</div>
					<div>
						<span class="block font-bold">Repository visibility:</span>
						<span class="block">{inputRepositoryPublic ? 'Public' : 'Private'}</span>
					</div>
					<button type="submit" class="btn btn-primary" disabled={loading}
						>Generate scaffolded project</button
					>
					<button type="button" class="btn btn-ghost" on:click={() => (step -= 1)}>Back</button>
				</div>
			</form>
		{/if}
	</div>
</div>
