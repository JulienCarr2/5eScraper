/**
 * spell.js
 * Based on the template command from discord.js's documentation found here:
 * https://discordjs.guide/creating-your-bot/slash-commands.html#individual-command-files
 * 
 * Uses axios and cheerio to scrape the page for the spell information.
 * 
 * Returns that something went wrong if the spell cannot be found on the given page.
 */

// Import the dependencies.
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'; // SlashCommandBuilder to easily create slash commands with discord.js
import * as helper from "../../helper/spells.js";

export const data = new SlashCommandBuilder()
  .setName('spell')
  .setDescription('Fetches the spell information from wikidot')
  .addStringOption(option => option.setName('spell-name')
    .setDescription('The spell name to lookup')
    .setRequired(true));

export async function execute(interaction) {
  /**
   * Scraping below with Cheerio and Axios.
   */
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
    const errorEmbed = new EmbedBuilder()
      .setColor(16711680)
      .setTitle('Error')
      .setDescription('The spell you are looking for cannot be found! Please try again!');
    await interaction.reply({ embeds: [errorEmbed] });
  }
}