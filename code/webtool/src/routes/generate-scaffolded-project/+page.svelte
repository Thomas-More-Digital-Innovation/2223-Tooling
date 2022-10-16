<script lang="ts">
	import { GetOrganizationMembersAndRepositories } from '$lib/graphql';
	import { settingStore } from '$lib/settingStore';
	import { Octokit } from '@octokit/rest';

	const organization = 'Thomas-More-Digital-Innovation';

	let client: Octokit;

	$: gitHubOrganizationMembersQuery = GetOrganizationMembersAndRepositories({
		variables: {
			organizationName: organization
		}
	});

	$: gitHubOrganizationMembers =
		$gitHubOrganizationMembersQuery.data.organization?.membersWithRole.edges || [];
	$: gitHubOrganizationRepositories =
		$gitHubOrganizationMembersQuery.data.organization?.repositories.edges || [];
	$: gitHubOrganizationTemplateRepositories =
		gitHubOrganizationRepositories.filter((repository) => repository?.node?.isTemplate) || [];

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
		.map((entry) => gitHubOrganizationMembers.findIndex((edge) => edge?.node?.login == entry[0]))
		.filter((v) => v !== -1 && v !== undefined && v !== null)
		.map((v) => gitHubOrganizationMembers[v]);

	settingStore.subscribe((newValue) => {
		client = new Octokit({
			auth: newValue.GitHubPersonalAccessToken
		});
	});

	function submitNext(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();
		step += 1;
	}

	async function submitReview(submitEvent: SubmitEvent) {
		submitEvent.preventDefault();

		loading = true;

		try {
			if (inputTemplate == 'None') {
				await client.repos.createInOrg({
					org: organization,
					name: repositoryName,
					description: repositoryDescription,
					visibility: inputRepositoryPublic ? 'public' : 'private'
				});
			} else {
				await client.repos.createUsingTemplate({
					template_owner: organization,
					template_repo: '2223-DI000-TemplateRepo',
					owner: organization,
					name: repositoryName,
					description: repositoryDescription,
					private: !inputRepositoryPublic
				});
			}

			await client.teams.create({
				org: organization,
				name: repositoryName,
				privacy: 'closed',
				repo_names: [`${organization}/${repositoryName}`]
			});

			await client.teams.addOrUpdateRepoPermissionsInOrg({
				org: organization,
				owner: organization,
				repo: repositoryName,
				team_slug: repositoryName,
				permission: 'push'
			});

			for (const teamMember of teamMembers) {
				await client.teams.addOrUpdateMembershipForUserInOrg({
					org: organization,
					team_slug: repositoryName,
					username: teamMember?.node?.login || '',
					role: 'member'
				});
			}

			success = true;
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
							<option>{repo?.node?.name}</option>
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
					{#each gitHubOrganizationMembers as member}
						<div class="form-control">
							<label class="label cursor-pointer">
								<div class="flex flex-row gap-4 items-center">
									<img src={member?.node?.avatarUrl} alt={member?.node?.login} class="h-10" />
									<div class="flex flex-col justify-center">
										{#if member?.node?.name}
											<span>{member?.node?.name}</span>
										{/if}
										<a
											class="label-text"
											href={member?.node?.url}
											target="_blank"
											rel="noopener noreferrer">{member?.node?.login}</a
										>
									</div>
								</div>
								<input
									type="checkbox"
									class="toggle"
									bind:checked={inputTeamMembers[member?.node?.login || '']}
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
								<img src={member?.node?.avatarUrl} alt={member?.node?.login} class="h-10" />
								<a
									class="label-text"
									href={member?.node?.url}
									target="_blank"
									rel="noopener noreferrer">{member?.node?.login}</a
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
