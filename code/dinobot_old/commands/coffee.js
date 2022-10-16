const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('coffee')
		.setDescription('Replies with your input!'),
	async execute(interaction) {
		// eslint-disable-next-line prefer-const
		let response = await fetch('https://tm-coffeecounter.jonasclaesbe.workers.dev/api/coffee-count');
		// eslint-disable-next-line prefer-const
		let data = await response.json();
		console.log(data);
		const embed = new EmbedBuilder()
			.setTitle('COFFEEEEE!!!')
			.setColor(0xd2a575)
			.setImage('https://imgur.com/QX6O7af')
			.setDescription(`Coffee count: ${data.amountOfCoffees}`)
			.setURL('https://jonasclaes.be/coffee-counter/')
			.setAuthor({ name: 'Jonas Claes', iconURL: 'https://avatars.githubusercontent.com/u/25551249?v=4', url: 'https://jonasclaes.be/' })
			.setThumbnail('https://imgur.com/QX6O7af')
			.setTimestamp()
			.setFooter({ text: 'Designed By Nick', iconURL: 'https://avatars.githubusercontent.com/u/91118370?v=4' });

		await interaction.reply({ embeds: [embed] });
	},
};
