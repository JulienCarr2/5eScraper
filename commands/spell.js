import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import * as helper from "../helper/spells.js";

export const data = new SlashCommandBuilder()
  .setName('spell')
  .setDescription('Fetches the spell information from wikidot')
  .addStringOption(option => option.setName('spell-name')
    .setDescription('The spell name to lookup')
    .setRequired(true));

export async function execute(interaction) {
  try {
    let [spellEmbed, linkRow] = await helper.buildSpell(interaction.options.getString('spell-name')); // Get the parameter and save it
    /**
     * Response Formation
     */
    await interaction.reply({
      embeds: [spellEmbed],
      components: [linkRow],
    });
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: 'There was an error finding your spell!', ephemeral: true });
  }
}