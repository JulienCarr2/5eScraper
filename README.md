# 5eScraper
## Overview
A Discord bot for viewing spells on dnd5e.wikidot. Uses Axios, Cheerio, and Discord.js to function.

## How to Run
This project is only verified to run on Node.js v18.13.0. Use other versions at your own discretion.

You **must** create a config.json file that includes a token, clientId, and guildId, all of which can be found by following the discord.js documentation.

Finally,
Load the project in VSCode then run the following command.
```
npm start
```

## Commands
Currently, the only command available is the following.
```
/spell {spell-name}
```
The description attribute maxes out at 1024 characters, so the description only grabs the first paragraph of the description. Nothing I can do about it, it's Discord's limit for embedded attributes.