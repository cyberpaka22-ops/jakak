const { cmd } = require('../command');
const yts = require('yt-search');
const axios = require('axios');

cmd({
pattern: "song",
alias: ["play", "music"],
desc: "Download YouTube Songs",
category: "download",
react: "🎧",
filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
try {

    if (!q) {
        return reply("❌ Please provide a song name.\n\nExample: .song Alan Walker Faded");
    }

    await reply("🔎 Searching song...");

    const search = await yts(q);
    const video = search.videos[0];

    if (!video) return reply("❌ Song not found.");

    const api = `https://podda-api.zone.id/ytmp3?url=${encodeURIComponent(video.url)}`;
    const { data } = await axios.get(api);

    if (!data.status || !data.result?.downloadUrl) {
        return reply("❌ Audio download failed.");
    }

    const audioUrl = data.result.downloadUrl;

    const caption = `

*〢━┅﹝𝗥𝗜𝗞𝗔 𝗫𝗠𝗗 💋﹞━┅*
*┃ 🎵 ᴛɪᴛʟᴇ :* ${video.title}
*┃ ⏱️ ᴅᴜʀᴀᴛɪᴏɴ :* ${video.timestamp}
*┃ 👤 ᴄʜᴀɴᴇʟ :* ${video.author.name}
*┃ 👁️ ᴠɪᴇᴡꜱ :* ${video.views}
*╰───────────── ❍*

© 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
`;

    await conn.sendMessage(
        from,
        {
            image: { url: video.thumbnail },
            caption
        },
        { quoted: mek }
    );

    await conn.sendMessage(
        from,
        {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg"
        },
        { quoted: mek }
    );

} catch (e) {
    console.log("Song Error:", e);
    reply("❌ Error: " + e.message);
}

});
