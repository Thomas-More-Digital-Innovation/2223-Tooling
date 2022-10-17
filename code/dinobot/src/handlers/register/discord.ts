import { Env } from "../..";
import { RESTPostAPIChatInputApplicationCommandsJSONBody, RouteBases, Routes } from "discord-api-types/v10";
import { Request } from "itty-router";
import { registeredCommands } from "../webhook/discord";

async function registerCommands(url: string, token: string, commands: RESTPostAPIChatInputApplicationCommandsJSONBody[]) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${token}`,
      },
      method: 'PUT',
      body: JSON.stringify(commands),
    });

    return response;
  }

export const registerDiscordHandler = async (req: Request, env: Env, ctx: ExecutionContext) => {
    const guildId = req.params?.guildid;
    if (!guildId) return new Response("Missing guild ID", { status: 400 });

    const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

    for (const commandKey of Object.keys(registeredCommands)) {
        const command = registeredCommands[commandKey];

        commands.push({
            name: command.name,
            description: command.description
        });
    }

    const url = RouteBases.api + Routes.applicationGuildCommands(env.DISCORD_APPLICATION_ID, guildId);

    const response = await registerCommands(url, env.DISCORD_TOKEN, commands);

    if (!response.ok) {
        return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("Created", { status: 201 });
}
