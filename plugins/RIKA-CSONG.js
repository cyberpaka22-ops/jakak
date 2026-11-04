const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
pattern: "csong",
desc: "Download and send song to WhatsApp Channel",
category: "channel",
react: "🎧",
filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
try {
    if (!q) {
        return reply("❌ Usage:.csong <channel_jid>,<song name>\nExample:.csong 120363xxxxxx@g.us,Alan Walker Faded");
    }

    let [channelJid,...songName] = q.split(',')
    songName = songName.join(',').trim()

    if (!channelJid ||!songName) {
        return reply("❌ Wrong format!\nUse:.csong <channel_jid>,<song name>")
    }

    // Searching message removed

    const search = await yts(songName);
    const video = search.videos[0];
    if (!video) return reply("❌ Song not found.");

    const api = `https://podda-api.zone.id/ytmp3?url=${encodeURIComponent(video.url)}`;
    const { data } = await axios.get(api);
    if (!data.status ||!data.result?.downloadUrl) {
        return reply("❌ Audio download failed.");
    }

    const audioUrl = data.result.downloadUrl;

    const caption = `
*〢━┅﹝𝗥𝗜𝗞𝗔 𝗫𝗠𝗗 💋﹞━┅*
*┃ 🎵 ᴛɪᴛʟᴇ :* ${video.title}
*┃ ⏱️ ᴅᴜʀᴀᴛɪᴏɴ :* ${video.timestamp}
*┃ 👤 ᴄʜᴀɴᴇʟ :* ${video.author.name}
*╰───────────── ❍*
> *ꜰᴇᴇʟɪɴɢ ꜱᴏɴɢ ꜰᴏʀ ʏᴏᴜ 🎀*
© 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
`;

    await conn.sendMessage(channelJid, { image: { url: video.thumbnail }, caption })
    await conn.sendMessage(channelJid, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: false
    })

    reply(`✅ Song sent to channel`)

} catch (e) {
    console.log("CSong Error:", e);
    reply("❌ Error: " + e.message);
}
});
