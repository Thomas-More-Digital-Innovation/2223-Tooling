import { verifyKey } from 'discord-interactions';
import { Request as IttyRequest, Router } from 'itty-router';
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

	COFFEE_COUNTER_WORKER: ServiceWorkerGlobalScope;

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
			// Using the incoming headers, verify this request actually came from discord.
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

		// Dispatch the request to the appropriate route
		return router.handle(request, env);
	},
};
