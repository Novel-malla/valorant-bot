require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let currentMatch = null;

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // CREATE MATCH
  if (msg.startsWith('!valorant')) {
    const time = msg.split(' ')[1] || 'tbd';

    currentMatch = {
      time,
      queue: []
    };

    return message.reply(
      `🎮 Valorant match created for ${time}\nType !join to join queue`
    );
  }

  // JOIN
  if (msg === '!join') {
    if (!currentMatch) {
      return message.reply('❌ No active match.');
    }

    if (currentMatch.queue.includes(message.author.id)) {
      return message.reply('⚠ You already joined.');
    }

    currentMatch.queue.push(message.author.id);

    const position = currentMatch.queue.length;

    message.reply(`✅ Joined queue. Position: ${position}`);

    // TEAM READY
    if (position === 5) {
      const team = currentMatch.queue
        .slice(0, 5)
        .map(id => `<@${id}>`)
        .join('\n');

      message.channel.send(`🔥 TEAM READY 🔥\n${team}`);
    }

    //test comment
    // CUSTOM SUGGEST
    if (position === 6) {
      message.channel.send(`⚠ 6+ players joined → Custom game possible`);
    }
  }

  // LEAVE
  if (msg === '!leave') {
    if (!currentMatch) {
      return message.reply('❌ No active match.');
    }

    const index = currentMatch.queue.indexOf(message.author.id);

    if (index === -1) {
      return message.reply('⚠ You are not in queue.');
    }

    currentMatch.queue.splice(index, 1);

    return message.reply('✅ You left the queue.');
  }

  // STATUS
  if (msg === '!status') {
    if (!currentMatch) {
      return message.reply('❌ No active match.');
    }

    const team = currentMatch.queue.slice(0, 5);
    const waiting = currentMatch.queue.slice(5);

    const teamText =
      team.length > 0
        ? team.map(id => `<@${id}>`).join('\n')
        : 'No players yet';

    const waitingText =
      waiting.length > 0
        ? waiting.map(id => `<@${id}>`).join('\n')
        : 'No waiting players';

    return message.reply(`
🎮 Match Time: ${currentMatch.time}

🔥 Main Team:
${teamText}

⏳ Waiting List:
${waitingText}
`);
  }

});


client.login(process.env.DISCORD_TOKEN);
