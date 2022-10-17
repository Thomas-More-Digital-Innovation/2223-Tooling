import type { RequestHandler } from '@sveltejs/kit';
import { graphql } from '@octokit/graphql';

export const GET: RequestHandler = async ({ platform }) => {
	try {
		const gitHubOrganizationMembersQuery = await graphql(
			`
				query GetOrganizationMembersAndRepositories($organizationName: String!) {
					organization(login: $organizationName) {
						membersWithRole(first: 100) {
							edges {
								node {
									login
									url
									avatarUrl
									name
								}
							}
						}

						repositories(first: 100) {
							edges {
								node {
									name
									isTemplate
								}
							}
						}
					}
				}
			`,
			{
				organizationName: 'Thomas-More-Digital-Innovation',
				headers: {
					authorization: `Bearer ${platform.env.GH_TOKEN}`
				}
			}
		);

		return new Response(
			JSON.stringify({
				status: 'OK',
				data: gitHubOrganizationMembersQuery
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
