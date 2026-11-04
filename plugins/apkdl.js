const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "apk",
    desc: "Download APK",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
    try {

        if (!q) return reply("Example:\n.apk WhatsApp");

        const { data } = await axios.get(
            `https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`
        );

        if (!data?.datalist?.list?.length) {
            return reply("❌ App not found");
        }

        const app = data.datalist.list[0];

        await conn.sendMessage(
            from,
            {
                document: {
                    url: app.file.path_alt
                },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${app.name}.apk`,
                caption:
`📦 ${app.name}
👨‍💻 ${app.developer?.name || "Unknown"}
📥 ${(app.size / 1024 / 1024).toFixed(2)} MB`
            },
            { quoted: mek }
        );

    } catch (e) {
        console.log(e);
        reply("❌ " + e.message);
    }
});
