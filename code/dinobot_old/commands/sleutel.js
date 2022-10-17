const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('key')
		.setDescription('Get or return the key')
		.addSubcommand(subcommand =>
			subcommand
				.setName('take')
				.setDescription('Take the key')
				.addUserOption(option => option.setName('target').setDescription('The user').setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('return')
				.setDescription('Return the key')
				.addUserOption(option => option.setName('target').setDescription('The user').setRequired(false))),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'take') {
			let user = interaction.options.getUser('target');
			if (!user) {
				user = interaction.user;
			}
			const embed = new EmbedBuilder()
				.setTitle('Someone took the key')
				.setColor(0xd2a575)
				.setDescription('Someone took the key and registered this with the waitress')
				.addFields(
					{ name: 'Person', value: `${user}`, inline: true },
					{ name: 'Discord Tag', value: `${user.tag}`, inline: true },
				)
				.setTimestamp()
				.setThumbnail(`${user.displayAvatarURL()}`)
				.setAuthor({ name: 'Designed by Nick', iconURL: 'https://avatars.githubusercontent.com/u/91118370?v=4' })
				.setFooter({ text: 'Kind regards, \nYour Dino waitress' });

			await interaction.reply({ embeds: [embed] });
		}
		else if (interaction.options.getSubcommand() === 'return') {
			let user = interaction.options.getUser('target');
			if (!user) {
				user = interaction.user;
			}
			const embed = new EmbedBuilder()
				.setTitle('Some returned the key')
				.setColor(0xd2a575)
				.setDescription('Someone returned the key and registered this with the waitress')
				.addFields(
					{ name: 'Person', value: `${user}`, inline: true },
					{ name: 'Discord Tag', value: `${user.tag}`, inline: true },
				)
				.setTimestamp()
				.setThumbnail(`${user.displayAvatarURL()}`)
				.setAuthor({ name: 'Designed by Nick', iconURL: 'https://avatars.githubusercontent.com/u/91118370?v=4' })
				.setFooter({ text: 'Kind regards, \nYour Dino waitress' });

			await interaction.reply({ embeds: [embed] });
		}
	},
};

