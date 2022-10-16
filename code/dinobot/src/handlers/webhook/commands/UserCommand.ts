import { ICommand } from "./ICommand";

export const UserCommand: ICommand = {
    name: 'user',
    description: 'Replies with user!',
    handler: async (interaction) => {
        return {
            content: `Your tag: ${interaction.member?.user.username}#${interaction.member?.user.discriminator}\nYour id: ${interaction.member?.user.id}`
        }
    }
}
