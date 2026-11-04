const { cmd } = require('../command');
const axios = require('axios'); // Udasamama danna hodai

cmd({
    pattern: "leakvideo", // .leakvideo
    alias: ["leak"], // .leak .lv .randleak
    desc: "Send random leak video.",
    category: "other", // Wena category 1kata dannath puluwan
    react: "🎥",
    filename: __filename
},
async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // React 🎥
        await conn.sendMessage(from, {
            react: { text: '🎥', key: mek.key }
        });

        const apiUrl = 'https://arslan-apis-v2.vercel.app/leakvideos';

        // Direct video send - JSON na, direct URL
        await conn.sendMessage(from, {
            video: { url: apiUrl },
            mimetype: 'video/mp4',
            fileName: `leak_video_${Date.now()}.mp4`,
            caption: `
〢━┅﹝𝗥𝗜𝗞𝗔 𝗫𝗠𝗗 🎀﹞━┅
┃🎥 *RANDOM LEAK VIDEO*
┃📌 *Source :* Arslan Leakvideos
╰━━━━━━━━━━━━━━⊷
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
`
          }, { quoted: mek }); // dtzminibot wenuwata { quoted: mek } damma

        // React ✅
        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (err) {
        console.error('Leak Video Error:', err.message);
        
        await conn.sendMessage(from, {
            text: '❌ Failed to send leak video. API might be down or slow.'
        }, { quoted: mek });

        await conn.sendMessage(from, {
            react: { text: '❌', key: mek.key }
        });
    }
});
