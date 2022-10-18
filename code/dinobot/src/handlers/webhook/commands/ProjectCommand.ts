import { ICommand } from "./ICommand";
import { APIGuildChannel, ChannelType, RouteBases, Routes } from 'discord-api-types/v10';

async function getCategory(url: string, token: string): Promise<APIGuildChannel<ChannelType.GuildText>> {
   const response = await fetch(url, {
      headers: {
         'Content-Type': 'application/json',
         Authorization: `Bot ${token}`,
      },
      method: 'GET',
   });
   return await response.json();
 }

export const ProjectCommand: ICommand = {
    definition: {
        name: 'project',
        description: 'Replies with your git project!',
    },
    handler: async (interaction, env) => {
      const channel = await getCategory(RouteBases.api + Routes.channel(interaction.channel_id), env.DISCORD_TOKEN);
      console.log(channel);

      if (channel?.parent_id != "889489685183856641") {
         return {
            content: "Something went wrong"
         }
      }
      return {
         content: `https://github.com/Thomas-More-Digital-Innovation/${channel?.name}`
      }
   }
}
