import type { RequestHandler } from '@sveltejs/kit';
import { getGitHubClient } from '$lib/gitHubClient';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const client = getGitHubClient(platform.env.GH_TOKEN);

		const members = await client.orgs.listMembers({
			org: "Thomas-More-Digital-Innovation"
		});

		const repositories = await client.repos.listForOrg({
			org: "Thomas-More-Digital-Innovation"
		});

		return new Response(
			JSON.stringify({
				status: 'OK',
				data: {
					members: members.data,
					repositories: repositories.data
				}
			}),
			{
				status: 200,
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
