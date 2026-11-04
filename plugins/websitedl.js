const { cmd } = require('../command');
const axios = require("axios");

cmd({
    pattern: "web",
    desc: "Download website",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) {
            return reply("*Example:*\n.web https://google.com");
        }

        await m.react("🌐");

        const api = `https://api.davidcyriltech.my.id/tools/downloadweb?url=${encodeURIComponent(q)}`;

        const { data } = await axios.get(api);

        if (!data?.response?.isFinished) {
            return reply("⌛ Website archive is still being generated. Try again in a few seconds.");
        }

        const downloadUrl = data?.response?.downloadUrl;

        if (!downloadUrl) {
            return reply("❌ Download link not found.");
        }

        await conn.sendMessage(
            from,
            {
                document: {
                    url: downloadUrl
                },
                mimetype: "application/zip",
                fileName: "website.zip",
                caption: `🌐 Website Download\n🔗 ${q}`
            },
            { quoted: mek }
        );

        await m.react("✅");

    } catch (e) {
        console.log(e);
        reply(`❌ ${e.message}`);
    }
});
