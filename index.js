const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");

const TOKEN = process.env.TOKEN; // You will add this in Railway safely
const GUILD_ID = "1396991590228037702";
const CHANNEL_ID = "1445534277935697931";

const RADIO_URL = "https://mira.streamerr.co/listen/fgstfm/radio.mp3";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on("ready", () => {
    console.log(`${client.user.tag} is online.`);

    const guild = client.guilds.cache.get(GUILD_ID);
    const channel = guild.channels.cache.get(CHANNEL_ID);

    const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    function play() {
        const resource = createAudioResource(RADIO_URL);
        player.play(resource);
    }

    // Restart if the stream stops
    player.on("idle", play);

    play();
    connection.subscribe(player);

    console.log("Radio stream started.");
});

client.login(TOKEN);
