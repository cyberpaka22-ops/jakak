const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "tt",
    alias: ["tiktok", "ttdl", "tiktokdl"],
    desc: "Download TikTok videos without watermark",
    category: "download",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("❌ Please provide a TikTok URL.\n\nExample:\n.tt https://vt.tiktok.com/xxxxx/");
        }

        if (!q.includes("tiktok.com") && !q.includes("vt.tiktok.com")) {
            return reply("❌ Invalid TikTok URL.");
        }

        await reply("⏳ *Downloading TikTok Video...*");

        const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(api);

        if (!data || !data.data || !data.data.play) {
            return reply("❌ Failed to fetch video.");
        }

        const videoUrl = data.data.play;
        const title = data.data.title || "No Title";
        const cover = data.data.cover;

        const caption = `
╭━━━〔 💗 *RIKA TT DL* 🧸 〕━━━⬣
┃ 🎵 *TikTok Download Success*
┃
┃ 📌 *Title:* ${title}
┃ ⚡ *Quality:* HD
┃ 👤 *Requested By:* @${m.sender.split('@')[0]}
┃ 🚀 *Status:* Completed
╰━━━━━━━━━━━━━━━━⬣

> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
`;
        await conn.sendMessage(
            from,
            {
                video: { url: videoUrl },
                caption: caption,
                mentions: [m.sender]
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log("TikTok Error:", e);

        reply(
            `❌ *TikTok Download Failed*\n\n` +
            `📛 Error: ${e.message}`
        );
    }
});
