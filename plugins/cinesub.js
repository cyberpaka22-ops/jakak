const { cmd } = require('../command');
const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    family: 4
});

const UA = 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/148.0.7778.178 Mobile Safari/537.36';
const BASE = 'https://cinesubz.net';
const NONCE = '11c13d6e10';

cmd({
    pattern: "cinesub",
    alias: ["movie", "cinesearch"],
    react: "🎬",
    desc: "Search movies from Cinesubz",
    category: "search",
    filename: __filename
},
async (conn, mek, m, {
    from,
    q,
    reply
}) => {

    try {

        if (!q) {
            return reply("🎬 Example:\n.cinesub avatar");
        }

        const { data } = await axios.get(
            `${BASE}/wp-json/zetaflix/search/?keyword=${encodeURIComponent(q)}&nonce=${NONCE}`,
            {
                headers: {
                    'User-Agent': UA,
                    'Referer': BASE
                },
                httpsAgent,
                timeout: 15000
            }
        );

        const results = Object.entries(data || {});

        if (!results.length) {
            return reply("❌ No results found.");
        }

        const movie = results[0][1];
        const movieId = results[0][0];

        let caption = `
〢━┅﹝𝗥𝗜𝗞𝗔 𝗫𝗠𝗗 🐲﹞━┅
🎬 *CINESUBZ MOVIE SEARCH*

📌 *Title:* ${movie.title || "N/A"}
⭐ *IMDB:* ${movie.extra?.imdb || "N/A"}
📅 *Date:* ${movie.extra?.date || "N/A"}
⏰ *Runtime:* ${movie.extra?.runtime || "N/A"}
🎭 *Genres:* ${movie.extra?.genres || "N/A"}

🔗 *Movie URL:*
${movie.url}

▶️ *Stream URL:*
${BASE}/jwplayer-2/?id=${movieId}&type=mp4

> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
`;

        if (movie.img) {
            await conn.sendMessage(
                from,
                {
                    image: { url: movie.img },
                    caption
                },
                { quoted: mek }
            );
        } else {
            reply(caption);
        }

    } catch (e) {
        console.log(e);
        reply("❌ Error: " + e.message);
    }
});
