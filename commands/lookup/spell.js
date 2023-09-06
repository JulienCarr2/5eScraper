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
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js'); // SlashCommandBuilder to easily create slash commands with discord.js
const cheerio = require('cheerio'); // Cheerio to select the <p> tags wanted to scrape the page for the description of the spell.
const axios = require('axios'); // Axios to send a get request tot eh server to get the webpage back.

module.exports = {
  // Description of spell
  data: new SlashCommandBuilder()
    .setName('spell')
    .setDescription('Fetches the spell information from wikidot')
    .addStringOption(option =>
      option.setName('spell-name')
        .setDescription('The spell name to lookup')
        .setRequired(true)),
  // Run the command
  async execute(interaction) {
    const param = interaction.options.getString('spell-name'); // Get the parameter and save it
    let spell = param.toLowerCase().replaceAll(" ", "-").replaceAll(/[^a-z-]/g, "");
    /**
     * Scraping below with Cheerio and Axios.
     */
    const lookup = "https://dnd5e.wikidot.com/spell:" + spell + "/"; // The URL of the spell
    // try {
    const response = await axios.get(lookup); // The response from the server
    const $ = cheerio.load(response.data); // Load the webpage into Cheerio
    const header = $('div.page-title.page-header span').text(); // Grab the header of the document, to ensure proper capitalization of the spell
    let $pc = $('div p'); // Target the <p> tags we are looking for.
    let spellList = []; // Initialize an empty array
    $pc.each((index, element) => {
      spellList[index] = $(element).text(); // Load each element's text into the array
    });

    let spellEmbed = new EmbedBuilder()
    if (spellList.at(-2).search("At Higher Levels.") !== -1) {
      spellEmbed
        .setColor(0x0099FF)
        .setTitle(header)
        .setURL(lookup)
        .setDescription(spellList[0])
        .addFields(
          { name: 'Type', value: spellList[1] },
          { name: 'Casting Time', value: spellList[2].split("\n")[0].split(": ")[1], inline: true },
          { name: 'Range', value: spellList[2].split("\n")[1].split(": ")[1], inline: true },
          { name: 'Components', value: spellList[2].split("\n")[2].split(": ")[1], inline: true },
          { name: 'Duration', value: spellList[2].split("\n")[3].split(": ")[1], inline: true },
          { name: 'Brief Description', value: spellList[3] },
          { name: 'At Higher Levels', value: spellList.at(-2).replace("At Higher Levels. ", "") },
        )
        .setTimestamp()
        .setFooter({ text: spellList.at(-1).split(". ")[1] });
    } else {
      spellEmbed
        .setColor(0x0099FF)
        .setTitle(header)
        .setURL(lookup)
        .setDescription(spellList[0])
        .addFields(
          { name: 'Type', value: spellList[1] },
          { name: 'Casting Time', value: spellList[2].split("\n")[0].split(": ")[1], inline: true },
          { name: 'Range', value: spellList[2].split("\n")[1].split(": ")[1], inline: true },
          { name: 'Components', value: spellList[2].split("\n")[2].split(": ")[1], inline: true },
          { name: 'Duration', value: spellList[2].split("\n")[3].split(": ")[1], inline: true },
          { name: 'Brief Description', value: spellList[3] },
        )
        .setTimestamp()
        .setFooter({ text: spellList.at(-1).split(". ")[1] });
    }

    /**
     * Response Formation
     */
    await interaction.reply({ embeds: [spellEmbed] }); // Have the bot reply with the formed message.
    // } catch (e) {
    //   const errorEmbed = new EmbedBuilder()
    //     .setColor(0xFF0000)
    //     .setTitle('Error')
    //     .setDescription('There was an issue finding the spell you were looking for!')
    //   await interaction.reply({ embeds: [errorEmbed] });
    // }
  },
};