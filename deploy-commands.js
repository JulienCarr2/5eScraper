import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as spell from './commands/spell.js';
import * as listSpells from './commands/list-spells.js';

// JSON parsing
const config = JSON.parse(fs.readFileSync('./config.json'));
const token = config.token;
const guildId = config.guildId;
const clientId = config.clientId;

const commands = [];
commands.push(spell.data.toJSON());
commands.push(listSpells.data.toJSON());

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log(`Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();