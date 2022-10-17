import { APIApplicationCommandInteraction, APIInteractionResponseCallbackData } from "discord-api-types/payloads/v10";
import { RESTPostAPIChatInputApplicationCommandsJSONBody } from "discord-api-types/v10";
import { Env } from "../../..";

export interface ICommand {
    definition: RESTPostAPIChatInputApplicationCommandsJSONBody;
    handler: (interaction: APIApplicationCommandInteraction, env: Env) => Promise<APIInteractionResponseCallbackData>;
}
