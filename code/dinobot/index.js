// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder, WebhookClient } = require('discord.js');
const { token } = require('./config.json');
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Searches commands and puts them in an Array
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// Dynamic command handler
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


// When the client is ready, run this code (only once)
const embed = new EmbedBuilder()
	.setTitle('Bot is online!')
	.setColor(0xd2a575);

const webhookClient = new WebhookClient({ url: 'https://discord.com/api/webhooks/1030564598690091098/e8DPjRccqtaqYIJmCGWwfZJDNgrgHogZ4-YrGuC8D2O01PLQ8AtBOQuJwHqOGwEO37Co/github' });

const main = async () => {
	const message = await webhookClient.editMessage('1030564598690091098', {
		username: 'DinoHook',
		embeds: [embed],
	});
};
main();

client.once('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);
	try {

		if (!webhookClient) {
			return console.log('No webhook was found that I can use!');
		}
		await webhookClient({
			name: 'DinoHook',
			embeds: [embed],
		});
	}
	catch (error) {
		console.error('Error trying to send a message: ', error);
	}
});
// Login to Discord with your client's token
client.login(token);