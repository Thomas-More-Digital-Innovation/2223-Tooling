import { ICommand } from "./ICommand";
import { APIEmbed, APIUser, ApplicationCommandOptionType, ApplicationCommandType, CDNRoutes, ImageFormat, RouteBases, Routes } from "discord-api-types/v10";

async function getUser(url: string, token: string) : Promise<APIUser> {
   const response = await fetch(url, {
     headers: {
       'Content-Type': 'application/json',
       Authorization: `Bot ${token}`,
     },
     method: 'GET',
     
   });

   return await response.json();
 }
export const KeyCommand: ICommand = {
   definition: {
      name: "key",
      description: "Replies with key!",
      options: [{
         name: "take",
         description: "Take the key",
         type: ApplicationCommandOptionType.Subcommand,
         options: [{ name: "target", type: ApplicationCommandOptionType.User, description: "The user", required: false }],
      }, {
         name: "return",
         description: "Return the key",
         type: ApplicationCommandOptionType.Subcommand,
         options: [{ name: "target", type: ApplicationCommandOptionType.User, description: "The user", required: false }],
      }
      ],
   },
 
   handler: async (interaction, env) => {
      let userId = null;
      let commandName = ""
      if (interaction.data.type === ApplicationCommandType.ChatInput) {
         if (interaction.data.options && interaction.data.options.length > 0 && interaction.data.options[0].type === ApplicationCommandOptionType.Subcommand) {
            const subcommand = interaction.data.options[0];
            commandName = interaction.data.options[0].name;
            if (subcommand.options && subcommand.options.length > 0 && subcommand.options[0].type === ApplicationCommandOptionType.User) {
               userId = subcommand.options[0].value;
               console.log(subcommand.options[0].value);
            }
         }
      }
      if (userId === null) {
         userId = interaction.member?.user.id
      }
      const user = await getUser(RouteBases.api + Routes.user(userId), env.DISCORD_TOKEN);

      console.log(user)

      if (commandName == 'take') {
         const embed: APIEmbed = {
            title: "Someone took the key",
            color: 0xd2a575,
            description: `<@${userId}> took the key and registered this with the waitress.`,
            author: {
               name: "Designed by Nick",
               icon_url: "https://avatars.githubusercontent.com/u/91118370?v=4",
            },
            fields: [{
               name: "Person",
               value: `<@${userId}>`,
               inline: true,

            },
            {
               name: 'Filled in by',
               value: `<@${interaction.member?.user.id}>`,
               inline: true
            },

            ],
            thumbnail: {
               url: RouteBases.cdn + CDNRoutes.userAvatar(user.id, user.avatar || "", user.avatar?.slice(0, 2) === 'a_' ? ImageFormat.GIF : ImageFormat.PNG)
            },
            footer: {
               text: "Kind regards, \nYour Dino waitress",
            },
            timestamp: new Date().toISOString()
         }
         return {
            embeds: [embed]
         }
      } else if (commandName == 'return') {
         const embed: APIEmbed = {
            title: "Someone returned the key",
            color: 0xd2a575,
            description: "Someone returned the key and registered this with the waitress.",
            author: {
               name: "Designed by Nick",
               icon_url: "https://avatars.githubusercontent.com/u/91118370?v=4",
            },
            fields: [{
               name: "Person",
               value: `<@${userId}>`,
               inline: true,

            },
            {
               name: 'Filled in by',
               value: `<@${interaction.member?.user.id}>`,
               inline: true
            },
            ],
            thumbnail: {
               url: RouteBases.cdn + CDNRoutes.userAvatar(user.id, user.avatar || "", user.avatar?.slice(0, 1) === 'a_' ? ImageFormat.GIF : ImageFormat.PNG)
            },
            footer: {
               text: "Kind regards, \nYour Dino waitress",
            },
            timestamp: new Date().toISOString()
         }
         return {
            embeds: [embed]
         }
      }else{
         return {
            content: "Something went wrong"
         }
      }
   }
}
