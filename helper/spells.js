/**
 * helper/spells.js
 * A helper file for the commands/lookup/spell.js file to better implement functions.
 */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js'; // SlashCommandBuilder to easily create slash commands with discord.js
import * as cheerio from 'cheerio'; // Cheerio to select the <p> tags wanted to scrape the page for the description of the spell.
import axios from 'axios'; // Axios to send a get request tot eh server to get the webpage back.

/**
 * @name parseSpell
 * @description Converts the inputted spell name into the DND5eWikidot's url for the given spell.
 * @param {String} spellName A string with the name of a given spell from the DND 5e Sourcebooks.
 * @returns {String} A string with the url of the given spell.
 */
function parseSpell(spellName) {
  // Doesn't matter if the string is a valid spell, it will be checked in scrapePage later.
  if (typeof (spellName) !== "string") {
    throw new TypeError("parseSpell: spellName must be a string!");
  }

  // Return the url for the given page. First, convert to lowercase, change all spaces to dashes, then remove any non-dash or letters.
  return "https://dnd5e.wikidot.com/spell:" + spellName.toLowerCase().replaceAll(" ", "-").replaceAll(/[^a-z-]/g, "") + "/";
}

/**
 * @name scrapePage
 * @description Scrapes the DND wikidot for a given spell to create an object descriptor.
 * @param {String} spellUrl A string with the given url for a webpage.
 * @returns {{name: String, url: String, source: String, type: String, castingTime: String, range: String, components: String, 
 * duration: String, higherLevels: String, description: String, class: Array.<String>, debug: [Number]}} An object representing the given spell.
 */
async function scrapePage(spellUrl) {
  // We aren't going to be strict about the parameter here, if they input a faulty URL somewhere, know that it'll cause an issue from Axios later.
  if (typeof (spellUrl) !== "string") {
    throw new TypeError("scrapePage: spellUrl must be a string!");
  }

  // Await an get request from the Wikidot servers.
  try {
    // GET Request to wikidot servers
    const response = await axios.get(spellUrl); // The response from the server

    // Gotten? Then, load the HTML with Cheerio into $ (Cheerio standard).
    const $ = cheerio.load(response.data); // Load the webpage into Cheerio

    // Select the header for safe keeping later. I could've just put this inline, but it's cleaner this way.
    const header = $('div.page-title.page-header span').text(); // Grab the header of the document, to ensure proper capitalization of the spell

    // Select all paragraph elements that are direct descendants of a divider element.
    let $pc = $('div p'); // Target the <p> tags we are looking for.

    // Load all the elements into an array, keeping only the text values.
    let spellList = []; // Initialize an empty array
    $pc.each((index, element) => {
      spellList[index] = $(element).text(); // Load each element's text into the array
    });

    // Split up casting time, range, components, and duration into their own array (They're considered one paragraph element on the webpage (IDK WHY?))
    const descriptors = spellList[2].split("\n");

    // Create a new object using the scraped data, removing the description string at the front of certain values (To prevent redundancy).
    let spellObj = {
      name: header, url: spellUrl, source: spellList[0].replace("Source: ", ""), type: spellList[1],
      castingTime: descriptors[0].replace("Casting Time: ", ""), range: descriptors[1].replace("Range: ", ""),
      components: descriptors[2].replace("Components: ", ""), duration: descriptors[3].replace("Duration: ", "")
    }

    // If the spell contains higher level instructions, we add it to the object. Otherwise, we load the description and add a debug tag for the length.
    // The reason why this is important, is because Discord's hardcoded limit on Embed description length is 4096, I believe.
    if (spellList.at(-2).search("At Higher Levels.") !== -1) {
      spellObj.description = spellList[3]
      if (spellList.slice(3, -2).length > 1) {
        spellObj.description = spellObj.description + "\n\n(Refer to the wiki for extended description.)"
      }
      spellObj.higherLevels = spellList.at(-2).replace("At Higher Levels. ", "");
    } else {
      spellObj.description = spellList[3]
      if (spellList.slice(3, -1).length > 1) {
        spellObj.description = spellObj.description + "\n\n(Refer to the wiki for extended description.)"
      }
    }
    spellObj.class = spellList.at(-1).replace("Spell Lists. ", "").split(", ");
    spellObj.debug = [spellObj.description.length];

    // Return the new object
    return spellObj;
  } catch (e) {
    // If something went wrong, assume that the spell was not found.
    throw new Error("scrapePage: Spell not found!");
  }
}

/**
 * @name buildSpell
 * @description Builds a embed to send in a discord message.
 * @param {String} spellName The name of the spell to build an embed for.
 * @returns {[EmbedBuilder,ActionRowBuilder]} The given embed for a specified spell.
 */
async function buildSpell(spellName) {
  // Redundant type checking, but whatever.
  if (typeof (spellName) !== "string") {
    throw new TypeError("parseSpell: spellName must be a string!");
  }

  // Create the spell object, throw if there's an issue.
  let spellObj;
  try {
    spellObj = await scrapePage(parseSpell(spellName))
  } catch (e) {
    throw new Error("buildSpell: " + e);
  }

  // Verify that the spell object was created with the right type.
  if (typeof (spellObj) !== "object" || spellObj == null) {
    throw new TypeError("buildSpell: There was an issue retrieving the object!");
  }

  // Create embed, attach properies.
  let spellEmbed = new EmbedBuilder();

  if ("higherLevels" in spellObj) {
    spellEmbed.addFields({ name: 'At Higher Levels', value: spellObj.higherLevels })
  }

  spellEmbed
    .setColor(39423)
    .setTitle(spellObj.name)
    .setURL(spellObj.url)
    .setDescription(spellObj.description)
    .addFields(
      { name: 'Source', value: spellObj.source },
      { name: 'Type', value: spellObj.type },
      { name: 'Casting Time', value: spellObj.castingTime, inline: true },
      { name: 'Range', value: spellObj.range, inline: true },
      { name: 'Components', value: spellObj.components, inline: true },
      { name: 'Duration', value: spellObj.duration, inline: true })
    .setTimestamp()
    .setFooter({ text: "This bot is not affiliated with WOTC or DND5eWikidot." });

  /**
  * Spell List Links
  */
  let classLinks = [];
  spellObj.class.forEach((element, index) => classLinks.push(new ButtonBuilder()
    .setLabel(element)
    .setURL('https://dnd5e.wikidot.com/spells:' + ((element.search("(Optional)") !== -1) ? element.replace(" (Optional)", "") : element).toLowerCase())
    .setStyle(ButtonStyle.Link)
  ));

  // Add components to an action row.
  let linkRow = new ActionRowBuilder().addComponents(classLinks);

  // Bundle the embed and row together and return it.
  return [spellEmbed, linkRow];
}

export {
  parseSpell,
  scrapePage,
  buildSpell,
};