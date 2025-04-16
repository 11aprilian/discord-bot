const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config({ path: __dirname + '/.env' });

const filePath = path.join(__dirname, 'spotify.json');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/spotify', (req, res) => {
  if (!fs.existsSync(filePath)) return res.status(204).json(null);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!data) return res.status(204).json(null);
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Spotify API ready at http://localhost:${PORT}/spotify`);
});

// Discord Bot Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once('ready', () => {
  console.log(`✅ Bot connected as ${client.user.tag}`);
});

client.on('presenceUpdate', (oldPresence, newPresence) => {
  const userId = process.env.DISCORD_USER_ID;
  if (!newPresence || newPresence.userId !== userId) return;

  const activity = newPresence.activities.find(
    (a) => a.name === 'Spotify' && a.type === 2
  );

  if (activity) {
    const spotifyData = {
      song: activity.details,
      artist: activity.state,
      album: activity.assets?.largeText,
      albumArt: `https://i.scdn.co/image/${activity.assets.largeImage.slice(8)}`,
      start: activity.timestamps.start,
      end: activity.timestamps.end,
    };

    fs.writeFileSync(filePath, JSON.stringify(spotifyData, null, 2));
    console.log(`🎵 Now playing: ${spotifyData.song} by ${spotifyData.artist}`);
  } else {
    fs.writeFileSync(filePath, JSON.stringify(null));
    console.log('🛑 User is not listening to Spotify.');
  }
});

client.login(process.env.DISCORD_TOKEN);
