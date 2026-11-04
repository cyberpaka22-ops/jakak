const { cmd } = require("../command");
const axios = require("axios");

const imageSessions = new Map();

cmd({
pattern: "img",
alias: ["image", "googleimage", "searchimg"],
react: "🖼️",
desc: "Search Google Images",
category: "search",
use: ".img <query>",
filename: __filename
}, async (conn, mek, m, { reply, args, from }) => {
try {

    const query = args.join(" ");

    if (!query) {
        return reply("🖼️ Please provide a search query.\nExample: .img cute cats");
    }

    await reply(`🔍 Searching images for "${query}"...`);

    const url = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
    const response = await axios.get(url);

    if (!response.data?.success || !response.data?.results?.length) {
        return reply("❌ No images found.");
    }

    const images = response.data.results
        .sort(() => 0.5 - Math.random())
        .slice(0, 5);

    imageSessions.set(from, {
        query,
        images,
        index: 0
    });

    await conn.sendMessage(from, {
        image: { url: images[0] },
        caption: `📷 Result for: ${query}\n\n📌 Image 1/${images.length}`,
        footer: "> ＰᴏᴡᴇʀᴇᴅＢʏ ＳʜᴀᴍɪᴋᴀＤᴅᴇɴᴜᴡᴀɴ 🐉",
        buttons: [
            {
                buttonId: ".nextimg",
                buttonText: {
                    displayText: "➡️ Next Image"
                },
                type: 1
            }
        ],
        headerType: 4,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363428073031350@newsletter",
                newsletterName: "Ｒɪᴋᴀ Ｘᴍᴅ 🐉"
            }
        }
    }, { quoted: mek });

} catch (error) {
    console.error(error);
    reply("❌ Failed to fetch images.");
}

});

cmd({
pattern: "nextimg",
react: "➡️",
desc: "Next image",
category: "search",
filename: __filename
}, async (conn, mek, m, { reply, from }) => {
try {

    const session = imageSessions.get(from);

    if (!session) {
        return reply("❌ No active image session.\nUse .img first.");
    }

    session.index++;

    if (session.index >= session.images.length) {
        imageSessions.delete(from);
        return reply("✅ All images finished.");
    }

    await conn.sendMessage(from, {
        image: {
            url: session.images[session.index]
        },
        caption: `📷 Result for: ${session.query}\n\n📌 Image ${session.index + 1}/${session.images.length}`,
        footer: "> ＰᴏᴡᴇʀᴇᴅＢʏ ＳʜᴀᴍɪᴋᴀＤᴅᴇɴᴜᴡᴀɴ 🐉",
        buttons: session.index + 1 < session.images.length ? [
            {
                buttonId: ".nextimg",
                buttonText: {
                    displayText: "➡️ Next Image"
                },
                type: 1
            }
        ] : [],
        headerType: 4,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363428073031350@newsletter",
                newsletterName: "Ｒɪᴋᴀ Ｘᴍᴅ Ｉᴍᴀɢᴇ 🐉"
            }
        }
    }, { quoted: mek });

} catch (e) {
    console.log(e);
    reply("❌ Error while loading next image.");
}

});
