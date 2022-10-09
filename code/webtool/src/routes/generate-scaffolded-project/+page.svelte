<script lang="ts">
	import { settingStore } from '$lib/settingStore';
	import { Octokit } from '@octokit/rest';
	import { onMount } from 'svelte';
	import type { RestEndpointMethodTypes } from '@octokit/rest';

	let gitHubOrganizationMembers: RestEndpointMethodTypes['orgs']['listMembers']['response']['data'] =
		[];
	let gitHubOrganizationRepos: RestEndpointMethodTypes['repos']['listForOrg']['response']['data'] =
		[];
	$: gitHubOrganizationTemplateRepos = gitHubOrganizationRepos.filter((repo) => repo.is_template);

	let client: Octokit;

	let step = 1;
	let loading = false;

	let inputAcademicYear = '2022-2023';
	let inputProjectCode = 'DI-001';
	let inputProjectSummary = 'Super handige DI tooling';
	let inputTemplate = 'None';
	let inputRepositoryPublic = false;
	let inputTeamMembers: { [key: string]: boolean } = {
		jonasclaes: true
	};

	onMount(() => {
		client = new Octokit({
			auth: $settingStore.GitHubPersonalAccessToken
		});

		client.rest.orgs
			.listMembers({
				org: 'Thomas-More-Digital-Innovation'
			})
			.then((res) => {
				gitHubOrganizationMembers = res.data;
			});

		client.rest.repos
			.listForOrg({
				org: 'Thomas-More-Digital-Innovation'
			})
			.then((res) => {
				gitHubOrganizationRepos = res.data;
			});
	});

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
		.map((entry) => entry[0]);

	function submitNext(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();
		step += 1;
	}

	async function submitReview(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();

		loading = true;

		try {
			if (inputTemplate == 'None') {
				await client.rest.repos.createInOrg({
					org: 'Thomas-More-Digital-Innovation',
					name: repositoryName,
					description: repositoryDescription,
					visibility: inputRepositoryPublic ? 'public' : 'private'
				});
			} else {
				await client.rest.repos.createUsingTemplate({
					template_owner: 'Thomas-More-Digital-Innovation',
					template_repo: '2223-DI000-TemplateRepo',
					owner: 'Thomas-More-Digital-Innovation',
					name: repositoryName,
					description: repositoryDescription,
					private: !inputRepositoryPublic
				});
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="grow">
	<div class="py-4 px-8 max-w-lg mx-auto flex flex-col gap-4">
		<h1 class="text-2xl font-bold">Generate scaffolded project</h1>
		<ul class="steps w-full">
			<li class="step step-primary">Project info</li>
			<li class="step {step >= 2 ? 'step-primary' : ''}">Set access</li>
			<li class="step {step >= 3 ? 'step-primary' : ''}">Review</li>
		</ul>
		{#if step == 1}
			<form on:submit={submitNext}>
				<div class="form-control w-full max-w-md">
					<label class="label" for="academicYear">
						<span class="label-text">Academic year?</span>
					</label>
					<input
						type="text"
						id="academicYear"
						placeholder="Type here"
						class="input input-bordered w-full max-w-md"
						bind:value={inputAcademicYear}
					/>
					<label class="label" for="academicYear">
						<span class="label-text-alt">Example: 2022-2023</span>
					</label>
				</div>
				<div class="form-control w-full max-w-md">
					<label class="label" for="projectCode">
						<span class="label-text">Project code?</span>
					</label>
					<input
						type="text"
						id="projectCode"
						placeholder="Type here"
						class="input input-bordered w-full max-w-md"
						bind:value={inputProjectCode}
					/>
					<label class="label" for="projectCode">
						<span class="label-text-alt">Project code from Excel sheet.</span>
						<span class="label-text-alt">Example: DI-001</span>
					</label>
				</div>
				<div class="form-control w-full max-w-md">
					<label class="label" for="projectSummary">
						<span class="label-text">Project summary?</span>
					</label>
					<input
						type="text"
						id="projectSummary"
						placeholder="Type here"
						class="input input-bordered w-full max-w-md"
						bind:value={inputProjectSummary}
					/>
					<label class="label" for="projectSummary">
						<span class="label-text-alt"
							>Enter a short project summary here. This will be used in the repo name as well as the
							description.</span
						>
					</label>
				</div>
				<div class="form-control w-full max-w-md">
					<label class="label" for="templateRepository">
						<span class="label-text">Which template do you want to use?</span>
					</label>
					<select class="select select-bordered" id="templateRepository" bind:value={inputTemplate}>
						<option selected>None</option>
						{#each gitHubOrganizationTemplateRepos as repo}
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
					<button type="submit" class="btn btn-primary max-w-md">Next</button>
				</div>
			</form>
		{/if}
		{#if step == 2}
			<form on:submit={submitNext}>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
					<span class="label label-text col-span-full">Who should have access?</span>
					{#each gitHubOrganizationMembers as member}
						<div class="form-control">
							<label class="label cursor-pointer">
								<div class="flex flex-row gap-4 items-center">
									<img src={member.avatar_url} alt={member.login} class="h-10" />
									<a
										class="label-text"
										href={member.html_url}
										target="_blank"
										rel="noopener noreferrer">{member.login}</a
									>
								</div>
								<input
									type="checkbox"
									class="toggle"
									bind:checked={inputTeamMembers[member.login]}
								/>
							</label>
						</div>
					{/each}
					<span class="label label-text-alt col-span-full"
						>Select the people that need access to this repository.</span
					>
				</div>
				<div class="flex flex-col gap-2">
					<button type="submit" class="btn btn-primary max-w-md">Next</button>
					<button type="button" class="btn btn-ghost max-w-md" on:click={() => (step -= 1)}
						>Back</button
					>
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
						{#each gitHubOrganizationMembers as member}
							{#if teamMembers.indexOf(member.login) != -1}
								<div class="flex flex-row gap-4 items-center">
									<img src={member.avatar_url} alt={member.login} class="h-10" />
									<a
										class="label-text"
										href={member.html_url}
										target="_blank"
										rel="noopener noreferrer">{member.login}</a
									>
								</div>
							{/if}
						{/each}
					</div>
					<div>
						<span class="block font-bold">Repository visibility:</span>
						<span class="block">{inputRepositoryPublic ? 'Public' : 'Private'}</span>
					</div>
					<button type="submit" class="btn btn-primary max-w-md" disabled={loading}
						>Generate scaffolded project</button
					>
					<button type="button" class="btn btn-ghost max-w-md" on:click={() => (step -= 1)}
						>Back</button
					>
				</div>
			</form>
		{/if}
	</div>
</div>
