import type { RequestHandler } from '@sveltejs/kit';
import { getGitHubClient } from '$lib/gitHubClient';

export interface GenerateScaffoldedProjectData {
	repositoryName: string;
	repositoryDescription: string;
	repositoryTemplate?: string;
	repositoryOrganization: string;
	repositoryVisibility: 'public' | 'private';
	repostoryMembers: string[];
}

export const POST: RequestHandler = async ({ request, platform }) => {
	try {
		const {
			repositoryName,
			repositoryDescription,
			repositoryTemplate,
			repositoryOrganization,
			repositoryVisibility,
			repostoryMembers
		} = await request.json();

		const client = getGitHubClient(platform.env.GH_TOKEN);

		if (repositoryTemplate) {
			await client.repos.createUsingTemplate({
				template_owner: repositoryOrganization,
				template_repo: '2223-DI000-TemplateRepo',
				owner: repositoryOrganization,
				name: repositoryName,
				description: repositoryDescription,
				private: repositoryVisibility === 'private'
			});
		} else {
			await client.repos.createInOrg({
				org: repositoryOrganization,
				name: repositoryName,
				description: repositoryDescription,
				visibility: repositoryVisibility
			});
		}

		await client.teams.create({
			org: repositoryOrganization,
			name: repositoryName,
			privacy: 'closed',
			repo_names: [`${repositoryOrganization}/${repositoryName}`]
		});

		await client.teams.addOrUpdateRepoPermissionsInOrg({
			org: repositoryOrganization,
			owner: repositoryOrganization,
			repo: repositoryName,
			team_slug: repositoryName,
			permission: 'push'
		});

		for (const repositoryMember of repostoryMembers) {
			await client.teams.addOrUpdateMembershipForUserInOrg({
				org: repositoryOrganization,
				team_slug: repositoryName,
				username: repositoryMember,
				role: 'member'
			});
		}

		return new Response(
			JSON.stringify({
				status: 'Created'
			}),
			{
				status: 201,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (err) {
		if (err instanceof Error) {
			return new Response(
				JSON.stringify({
					error: err.message
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		} else {
			return new Response(
				JSON.stringify({
					error: 'Internal Server Error'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}
	}
};
