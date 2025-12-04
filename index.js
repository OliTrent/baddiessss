const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    VoiceConnectionStatus,
    StreamType
} = require("@discordjs/voice");

const { spawn } = require("child_process");

const TOKEN = process.env.TOKEN;

// YOUR SERVER + CHANNEL
const GUILD_ID = "1396991590228037702";
const CHANNEL_ID = "1445534277935697931";

// YOUR RADIO STREAM (works with anything)
const RADIO_URL = "https://mira.streamerr.co/listen/fgstfm/radio.mp3";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});


client.once("ready", async () => {
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

    try {
        console.log("⏳ Waiting for READY state...");
        await entersState(connection, VoiceConnectionStatus.Ready, 20_000);
        console.log("🎉 Voice connection ready.");
    } catch (error) {
        console.log("❌ Failed to connect:", error);
        return;
    }

    const player = createAudioPlayer();

    function startFFmpeg() {
        console.log("▶️ Starting FFmpeg stream...");

        const ffmpeg = spawn("ffmpeg", [
            "-reconnect", "1",
            "-reconnect_streamed", "1",
            "-reconnect_delay_max", "5",
            "-i", RADIO_URL,
            "-f", "s16le",
            "-ar", "48000",
            "-ac", "2",
            "pipe:1"
        ]);

        ffmpeg.stderr.on("data", data => {
            // Uncomment for debugging:
            // console.log("FFmpeg:", data.toString());
        });

        ffmpeg.on("close", () => {
            console.log("❌ FFmpeg closed. Restarting...");
            startFFmpeg();
        });

        return ffmpeg.stdout;
    }

    // FIRST PLAY
    const stream = startFFmpeg();

    player.play(createAudioResource(stream, {
        inputType: StreamType.Raw
    }));

    // Restart if idle
    player.on("idle", () => {
        console.log("🔁 Player idle — restarting FFmpeg.");
        const newStream = startFFmpeg();
        player.play(createAudioResource(newStream, {
            inputType: StreamType.Raw
        }));
    });

    player.on("error", err => console.log("❌ Audio player error:", err));

    connection.subscribe(player);

    console.log("🎶 Radio stream is now playing via FFmpeg!");
});

client.login(TOKEN);
