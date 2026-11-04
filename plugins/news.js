const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "gagana",
    alias: ["gagananews"],
    desc: "Get the latest news from Gagana.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://saviya-kolla-api.koyeb.app/news/gagana';
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗚𝗮𝗴𝗮𝗻𝗮 𝗻𝗲𝘄𝘀.*");

        const result = data.result;
        const newsInfo = `╭─── « 📰 𝗚𝗔𝗚𝗔𝗡𝗔 𝗡𝗘𝗪𝗦 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${result.desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.url}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});


cmd({
    pattern: "derana",
    alias: ["adaderana", "derananews"],
    desc: "Get the latest news from Ada Derana.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = `https://api.srihub.store/news/derana?apikey=dew_HFHK1BMLQLKAKmm3QfE5oIKEWwFFIUwX4zwBeEDK`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗗𝗲𝗿𝗮𝗻𝗮 𝗻𝗲𝘄𝘀.*");

        const result = data.result;
        const newsInfo = `╭─── « 📰 𝗔𝗗𝗔 𝗗𝗘𝗥𝗔𝗡𝗔 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${result.desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.url}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});


cmd({
    pattern: "lankadeepa",
    alias: ["deepa", "lankadeepanews"],
    desc: "Get the latest news from Lankadeepa.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://private-api-ebon.vercel.app/news/lankadeepa';
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗟𝗮𝗻𝗸𝗮𝗱𝗲𝗲𝗽𝗮 𝗻𝗲𝘄𝘀.*");

        const result = data.result;
        const newsInfo = `╭─── « 📰 𝗟𝗔𝗡𝗞𝗔𝗗𝗘𝗘𝗣𝗔 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${result.desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.link}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});


cmd({
    pattern: "sirasa",
    alias: ["sirasanews", "news1st"],
    desc: "Get the latest news from Sirasa News1st.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://private-api-ebon.vercel.app/news/sirasa';
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗦𝗶𝗿𝗮𝘀𝗮 𝗻𝗲𝘄𝘀.*");

        const result = data.result;

        // Clean HTML characters
        let desc = (result.desc || "")
            .replace(/&l;/g, '<').replace(/&g;/g, '>')
            .replace(/&quot;/g, '"').replace(/&amp;/g, '&')
            .replace(/&a;quot;/g, '"').replace(/&a;nbsp;/g, ' ')
            .replace(/<[^>]*>/g, '').replace(/\n\s*\n/g, '\n').trim();

        const newsInfo = `╭─── « 📰 𝗦𝗜𝗥𝗔𝗦𝗔 𝗡𝗘𝗪𝗦 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date ? result.date.split('T')[0] : 'Today'}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.link}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});

cmd({
    pattern: "hiru",
    alias: ["hirunews"],
    desc: "Get the latest news from Hiru News.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://private-api-ebon.vercel.app/news/hiru';
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗛𝗶𝗿𝘂 𝗻𝗲𝘄𝘀.*");

        const result = data.result;
        const newsInfo = `╭─── « 📰 𝗛𝗜𝗥𝗨 𝗡𝗘𝗪𝗦 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date ? result.date.split(' ')[0] : 'Today'}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${result.desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.link}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});


cmd({
    pattern: "itn",
    alias: ["itnnews"],
    desc: "Get the latest news from ITN.",
    category: "news",
    react: "📰",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://private-api-ebon.vercel.app/news/itn';
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) return reply("❌ *𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗳𝗲𝘁𝗰𝗵 𝗜𝗧𝗡 𝗻𝗲𝘄𝘀.*");

        const result = data.result;
        const newsInfo = `╭─── « 📰 𝗜𝗧𝗡 𝗡𝗘𝗪𝗦 📰 » ───
│
│ ➢ ❝ ${result.title} ❞
│
│ 📅 *𝗗𝗮𝘁𝗲:* ${result.date}
│
│ 📃 *𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:*
│ ${result.desc}
│
│ 🔗 *𝗟𝗶𝗻𝗸:* ${result.link}
│
╰───────────────⟡
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (result.image) {
            await conn.sendMessage(from, { image: { url: result.image }, caption: newsInfo }, { quoted: mek });
        } else {
            await reply(newsInfo);
        }
    } catch (e) {
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});
