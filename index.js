import * as fs from 'fs';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import * as spell from './commands/spell.js';
import * as listSpells from './commands/list-spells.js';

// JSON parsing
const config = JSON.parse(fs.readFileSync('./config.json'));
const token = config.token;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.commands.set(spell.data.name, spell);
client.commands.set(listSpells.data.name, listSpells);

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.login(token);