import { APIApplicationCommandInteraction, APIInteractionResponseCallbackData } from "discord-api-types/payloads/v10";
import { Env } from "../../..";

export interface ICommand {
    name: string;
    description: string;
    handler: (interaction: APIApplicationCommandInteraction, env: Env) => Promise<APIInteractionResponseCallbackData>;
}
