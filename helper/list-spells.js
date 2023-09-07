import * as cheerio from 'cheerio';
import axios from 'axios';

async function findSpells(className, level) {
  const url = "https://dnd5e.wikidot.com/spells:" + className + "/";
  const response = await axios.get(url);

  const $ = cheerio.load(response.data);
  let $t = $('#wiki-tab-0-' + level + ' tr');

  if ($t.length === 0) {
    throw new Error("findSpells: No spells at that given level for that class.")
  }
  let spellList = [];
  $t.each((index, element) => {
    spellList[index] = $(element).text().trim().split("\n")[0]; // Load each element's text into the array
  })
  spellList = spellList.slice(1);
  return (spellList);
}

export { findSpells }