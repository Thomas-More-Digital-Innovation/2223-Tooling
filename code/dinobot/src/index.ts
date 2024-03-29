import { Webhooks } from '@octokit/webhooks';
import { APIChannel, APIEmbed, APIGuildChannel, APIGuildTextChannel, APITextBasedChannel, ChannelType, GuildTextChannelType, RESTGetAPIGuildChannelsResult, RESTPostAPIChannelMessageJSONBody, RESTPostAPIGuildChannelJSONBody, RouteBases, Routes } from 'discord-api-types/v10';
import { verifyKey } from 'discord-interactions';
import { Request as IttyRequest, Router } from 'itty-router';
import { registerDiscordHandler } from './handlers/register/discord';
import { webhookDiscordHandler } from './handlers/webhook/discord';

/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	DISCORD_TOKEN: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
	GITHUB_WEBHOOK_SECRET: string;
	COFFEE_COUNTER_WORKER?: ServiceWorkerGlobalScope;
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}

const router = Router();

router
	.get("/", (req, env, ctx) => {
		return new Response("You've reached /", { status: 200 });
	})
	.get("/register/discord/:guildid", registerDiscordHandler)
	.post("/webhook/discord", webhookDiscordHandler)
	.get("*", (req: IttyRequest) => new Response("Not Found", { status: 404 }));

export default {
	/**
	* Every request to a worker will start in the `fetch` method.
	* Verify the signature with the request, and dispatch to the router.
	* @param {*} request A Fetch Request object
	* @param {*} env A map of key/value pairs with env vars and secrets from the cloudflare env.
	* @returns
	*/
	async fetch(request: Request, env: Env) {
		const url = new URL(request.url);
		if (request.method === 'POST' && url.pathname === '/webhook/discord') {
			// Using the incoming headers, verify this request actually came from Discord.
			const signature = request.headers.get('x-signature-ed25519');
			const timestamp = request.headers.get('x-signature-timestamp');
			// console.log(signature, timestamp, env.DISCORD_PUBLIC_KEY);
			const body = await request.clone().arrayBuffer();
			const isValidRequest = verifyKey(
				body,
				signature || "",
				timestamp || "",
				env.DISCORD_PUBLIC_KEY
			);
			if (!isValidRequest) {
				console.error('Invalid Request');
				return new Response('Bad request signature.', { status: 401 });
			}
		}

		if (request.method === 'POST' && url.pathname === '/webhook/github') {
			// Using the incoming headers, verify this request actually came from GitHub.
			const githubDeliveryId = request.headers.get('x-github-delivery');
			const githubEventName = request.headers.get('x-github-event');
			const githubSignature = request.headers.get('x-hub-signature-256');

			const body = await request.json();

			const webhook = new Webhooks({
				secret: env.GITHUB_WEBHOOK_SECRET,
			});
			webhook.on("team.created", async event => {
				async function teamCreated(url: string, token: string, channelCreate: RESTPostAPIGuildChannelJSONBody): Promise<APITextBasedChannel<ChannelType.GuildText>> {
					const response = await fetch(url, {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bot ${token}`,
						},
						method: 'POST',
						body: JSON.stringify(channelCreate),
					});

					return await response.json();
				}

				console.log(event.payload.team.name)
				const channelCreate: RESTPostAPIGuildChannelJSONBody = {
					name: `${event.payload.team.name}`,
					type: 0,
					parent_id: "889489685183856641",

				};
				const message = await teamCreated(RouteBases.api + Routes.guildChannels("889485898847232020"), env.DISCORD_TOKEN, channelCreate);

				async function teamMessage(url: string, token: string, sendMessage: RESTPostAPIChannelMessageJSONBody) {
					const response = await fetch(url, {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bot ${token}`,
						},
						method: 'POST',
						body: JSON.stringify(sendMessage),
					});
					return response;
				} 
				const sendMessage: RESTPostAPIChannelMessageJSONBody = {
					content: `https://github.com/${event.payload.organization.login}/${event.payload.team.name}`,
				};
				await teamMessage(RouteBases.api + Routes.channelMessages(message.id), env.DISCORD_TOKEN, sendMessage);
			});




			webhook.on("pull_request.opened", async event => {
				async function getChannel(url: string, token: string): Promise<APIGuildChannel<ChannelType.GuildText>[]> {
					const response = await fetch(url, {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bot ${token}`,
						},
						method: 'GET',
					});

					return await response.json();
				}
				// console.log(event.payload.pull_request)

				const channels = await getChannel(RouteBases.api + Routes.guildChannels("889485898847232020"), env.DISCORD_TOKEN);
				console.log(channels)
				
				const channelName: any = channels.find(channel => {
					return channel.name === `${event.payload.pull_request.head.repo.name.toLowerCase()}`
				});

				console.log(channelName)

				async function pullMessage(url: string, token: string, sendPullMessage: RESTPostAPIChannelMessageJSONBody) {
					const response = await fetch(url, {
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bot ${token}`,
						},
						method: 'POST',
						body: JSON.stringify(sendPullMessage),
					});
					return response;
				} 

				const embed: APIEmbed = {
					title: `${event.payload.pull_request.title} by ${event.payload.pull_request.user.login} · Pull Request #${event.payload.pull_request.number} · ${event.payload.pull_request.head.repo.full_name}`,
					color: 0xd2a575,
					url: `${event.payload.pull_request.html_url}`,
					author: {
						 name: "GitHub",
					},
					thumbnail: {
						 url: `https://opengraph.githubassets.com/${event.payload.pull_request.base.sha}/${event.payload.pull_request.head.repo.full_name}/pull/${event.payload.pull_request.number}`,
					},
					footer: {
						 text: "Designed By Nick",
						 icon_url: "https://avatars.githubusercontent.com/u/91118370?v=4"
					},
					timestamp: new Date().toISOString()
			  }
	
				const sendPullMessage: RESTPostAPIChannelMessageJSONBody = {
					content: `A new pull request has arrived! (#${event.payload.pull_request.number})\nYou can find it here: ${event.payload.pull_request.html_url}`,
					embeds: [embed],
				};
				
				await pullMessage(RouteBases.api + Routes.channelMessages(channelName?.id), env.DISCORD_TOKEN, sendPullMessage);
			});

			await webhook.verifyAndReceive({
				// @ts-ignore
				id: githubDeliveryId,
				// @ts-ignore
				name: githubEventName,
				// @ts-ignore
				payload: body,
				// @ts-ignore
				signature: githubSignature
			}).catch(err => {
				console.error('Invalid Request');
				return new Response('Bad request signature.', { status: 401 });
			});

			return new Response("OK", { status: 200 });
		}

		// Dispatch the request to the appropriate route
		return router.handle(request, env);
	},
};
