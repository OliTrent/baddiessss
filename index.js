const { 
    Client, 
    GatewayIntentBits 
} = require("discord.js");

const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    entersState,
    VoiceConnectionStatus 
} = require("@discordjs/voice");

const TOKEN = process.env.TOKEN;

// YOUR SERVER + CHANNEL
const GUILD_ID = "1396991590228037702";
const CHANNEL_ID = "1445534277935697931";

// YOUR RADIO STREAM
const RADIO_URL = "https://mira.streamerr.co/listen/fgstfm/radio.mp3";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on("clientReady", async () => {
    console.log(`${client.user.tag} is online.`);

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) return console.log("❌ Guild not found");

    const channel = guild.channels.cache.get(CHANNEL_ID);
    if (!channel) return console.log("❌ Channel not found");

    console.log(`Joining channel: ${channel.name}`);

    const connection = joinVoiceChannel({
        channelId: CHANNEL_ID,
        guildId: GUILD_ID,
        adapterCreator: guild.voiceAdapterCreator
    });

    connection.on("stateChange", (oldState, newState) => {
        console.log(`Voice connection: ${oldState.status} → ${newState.status}`);
    });

    // Wait until connected
    try {
        console.log("⏳ Waiting for READY state...");
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        console.log("🎉 Connection READY — starting audio...");
    } catch (err) {
        console.log("❌ Failed to establish voice connection:", err);
        return;
    }

    const player = createAudioPlayer();

    // Restart if stops
    player.on("idle", () => {
        console.log("🔁 Stream idle — restarting...");
        player.play(createAudioResource(RADIO_URL));
    });

    player.on("error", error => {
        console.log("❌ Audio player error:", error.message);
    });

    // Start playing
    player.play(createAudioResource(RADIO_URL));
    connection.subscribe(player);

    console.log("🎶 Radio stream is now playing!");
});

// New discord.js v14 event name
client.once("ready", () => {
    client.emit("clientReady");
});

client.login(TOKEN);
