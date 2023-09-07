/**
 * helper/spells.js
 * A helper file for the commands/lookup/spell.js file to better implement functions.
 */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js'; // SlashCommandBuilder to easily create slash commands with discord.js
import cheerio from 'cheerio'; // Cheerio to select the <p> tags wanted to scrape the page for the description of the spell.
import axios from 'axios'; // Axios to send a get request tot eh server to get the webpage back.

/**
 * @name parseSpell
 * @description Converts the inputted spell name into the DND5eWikidot's url for the given spell.
 * @param {String} spellName A string with the name of a given spell from the DND 5e Sourcebooks.
 * @throws {TypeError} Throws a TypeError if the parameter is not of type string.
 * @returns {String} A string with the url of the given spell.
 */
function parseSpell(spellName) {
  if (typeof (spellName) !== String) {
    throw new TypeError("parseSpell: spellName must be a String!");
  }
  return "https://dnd5e.wikidot.com/spell:" + spellName.toLowerCase().replaceAll(" ", "-").replaceAll(/[^a-z-]/g, "") + "/";
}

export {
  parseSpell,
};