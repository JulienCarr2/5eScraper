import { SlashCommandBuilder } from 'discord.js';
import * as helper from '../helper/list-spells.js'

export const data = new SlashCommandBuilder()
  .setName('list-spells')
  .setDescription('Fetches the spell list for a given class from wikidot')
  .addStringOption(option => option.setName('class')
    .setDescription('The class to lookup')
    .setRequired(true)
    .addChoices(
      { name: 'Artificer', value: 'Artificer' },
      { name: 'Bard', value: 'Bard' },
      { name: 'Cleric', value: 'Cleric' },
      { name: 'Druid', value: 'Druid' },
      { name: 'Paladin', value: 'Paladin' },
      { name: 'Ranger', value: 'Ranger' },
      { name: 'Sorcerer', value: 'Sorcerer' },
      { name: 'Warlock', value: 'Warlock' },
      { name: 'Wizard', value: 'Wizard' },
    ))
  .addIntegerOption(option => option.setName('level')
    .setDescription('Level of spells to lookup (0-9).')
    .setRequired(true))

export async function execute(interaction) {
  try {
    let level = 0;
    if (interaction.options.getInteger("level") != undefined) {
      level = interaction.options.getInteger("level");
    }
    let spellList = await helper.findSpells(interaction.options.getString("class"), level);
    const listString = spellList.reduce((x, y) => x + "\n" + y);
    await interaction.reply({
      content: '>>> # ' + interaction.options.getString("class") + ' Spell List\n## ' + level.toString() + 'th level spells\n' + listString
    });
  } catch {
    await interaction.reply({ content: 'There are no spells of that level for that class!', ephemeral: true });
  }
}