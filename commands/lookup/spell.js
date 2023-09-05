const { SlashCommandBuilder } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('spell')
    .setDescription('Fetches the spell information from wikidot')
    .addStringOption(option =>
      option.setName('spell-name')
        .setDescription('The spell name to lookup')),
  async execute(interaction) {
    const param = interaction.options.getString('spell-name');
    let spell = param.toLowerCase().replaceAll(" ", "-").replaceAll(/[^a-z-]/g, "");
    const host = "https://dnd5e.wikidot.com/";
    let lookup = host + "spell:" + spell + "/";
    const response = await axios.get(lookup);
    const $ = cheerio.load(response.data);
    let $pc = $('div p');
    let spellList = [];
    $pc.each((index, element) => {
      spellList[index] = $(element).text();
    });
    await interaction.reply(">>> " + "# " + param + "\n" + spellList.join("\n"));
  },
};