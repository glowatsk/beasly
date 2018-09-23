const Discord = require('discord.js');
const fetch = require('node-fetch');

const client = new Discord.Client();

require('dotenv').config();

const options = [
  '$commands',
  '$ping',
  '$counter',
  '$laningPartner',
  '$arenaStandings',
  '$PvPTalents',
];

// Note to log into discord

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
  if (msg.author.bot) return;

  if (msg.content === 'Hello Beasly') msg.channel.send('Hello');

  if (msg.content.indexOf('$') !== 0) return;

  const args = msg.content.slice(1).trim().split(/[ $]+/g);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    msg.reply('pong');
  }

  if (command === 'commands') {
    msg.reply('Here are the following commands:');
    options.map(x => msg.channel.send(x));
  }

  if (command === 'counter') {
    msg.reply(`Fetching counter suggestions for the following: ${args.map(x => x)}`);
    args.map();
  }

  if (command === 'talents') {
    const characterName = args[0];
    const realmName = args[1];
    fetch(`https://us.api.battle.net/wow/character/${realmName}/${characterName}?fields=talents&locale=en_US&apikey=${process.env.BLIZZ_TOKEN}`)
      .then(res => res.json())
      .then(characterTalentJSON => (characterTalentJSON.talents[0].talents))
      .then((characterTalents) => {
        let sortedTalents = [];
        characterTalents.map((talent) => {
          sortedTalents.push({
            tier: talent.tier,
            talentName: talent.spell.name,
          });
        });
        sortedTalents = sortedTalents.sort((a, b) => a.tier - b.tier);
        let talentMessage = `Here are ${characterName}'s talents: \n`;
        sortedTalents.forEach((talentRow) => {
          talentMessage += (`Tier ${talentRow.tier}: ${talentRow.talentName} \n`);
        });
        msg.reply(talentMessage);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  if (command === 'ratings') {
    const characterName = args[0];
    const realmName = args[1];
    fetch(`https://us.api.battle.net/wow/character/${realmName}/${characterName}?fields=pvp&locale=en_US&apikey=${process.env.BLIZZ_TOKEN}`)
      .then(res => res.json())
      .then(pvpStatsJSON => pvpStatsJSON.pvp.brackets)
      .then((pvpStats) => {
        const twosStats = `2v2: \n Rating: ${pvpStats.ARENA_BRACKET_2v2.rating} \n Weekly Played: ${pvpStats.ARENA_BRACKET_2v2.weeklyPlayed} \n Weekly Won: ${pvpStats.ARENA_BRACKET_2v2.weeklyWon}`;
        const threesStats = `3v3: \n Rating: ${pvpStats.ARENA_BRACKET_3v3.rating} \n Weekly Played: ${pvpStats.ARENA_BRACKET_3v3.weeklyPlayed} \n Weekly Won: ${pvpStats.ARENA_BRACKET_3v3.weeklyWon}`;
        const ratingsMessage = `${twosStats} \n \n ${threesStats}`;
        msg.channel.send(`Ratings for ${characterName} ${realmName}`);
        msg.channel.send(ratingsMessage);
      })
      .catch(err => console.log(err));
  }
});

client.login(process.env.BOT_TOKEN);
