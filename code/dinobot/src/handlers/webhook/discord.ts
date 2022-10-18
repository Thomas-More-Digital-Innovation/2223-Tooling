import { Request } from "itty-router";
import { Env } from "../..";
import { APIInteraction, APIInteractionResponse, InteractionResponseType, InteractionType } from 'discord-api-types/payloads/v10';
import { ICommand } from "./commands/ICommand";
import { UserCommand } from "./commands/UserCommand";
import { CoffeeCommand } from "./commands/CoffeeCommand";
import { KeyCommand } from "./commands/KeyCommand";
import { ProjectCommand } from "./commands/ProjectCommand";

export const registeredCommands: {[key: string]: ICommand} = {};

// Commands
registeredCommands[UserCommand.definition.name.toLowerCase()] = UserCommand;
registeredCommands[CoffeeCommand.definition.name.toLowerCase()] = CoffeeCommand;
registeredCommands[KeyCommand.definition.name.toLowerCase()] = KeyCommand;
registeredCommands[ProjectCommand.definition.name.toLowerCase()] = ProjectCommand;

class JsonResponse extends Response {
    constructor(body: APIInteractionResponse, init?: any) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}

export const webhookDiscordHandler = async (req: Request, env: Env, ctx: ExecutionContext) => {
    if (!req.json) return new Response("Internal server error.", { status: 500 });

    const message: APIInteraction = await req.json();
    // console.log(message);

    if (message.type === InteractionType.Ping) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        console.log('Handling Ping request');
        return new JsonResponse({
            type: InteractionResponseType.Pong,
        });
    }

    if (message.type === InteractionType.ApplicationCommand) {
        const commandName = message.data.name.toLowerCase();

        console.log(registeredCommands)

        if (registeredCommands[commandName]) {
            const data = await registeredCommands[commandName].handler(message, env);
            return new JsonResponse({
                type: InteractionResponseType.ChannelMessageWithSource,
                data
            });
        }
    }

    console.error('Unknown Type');
    // @ts-ignore
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
}
