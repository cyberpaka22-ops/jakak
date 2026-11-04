const { cmd } = require('../command');
const axios = require("axios");

function getQuery(args) {
    if (!args) return "";
    if (Array.isArray(args)) return args.join(" ").trim();
    if (typeof args === "string") return args.trim();
    if (typeof args === "object") return Object.values(args).join(" ").trim();
    return "";
}

cmd({
    pattern: "mediafire",
    alias: ["mf", "mfdl"],
    category: "download",
    fromMe: false,
    desc: "📥 කිසිදු API එකක් නොමැතිව කෙලින්ම MediaFire ෆයිල් ඩවුන්ලෝඩ් කරන්න"
}, async (conn, mek, m, { from, q, isOwner, reply, prefix, pushname, sessionId }) => {
    const args = q;
    try {
        let rawInput = getQuery(args);
        
        if (!rawInput) {
            return m.reply(`📥 *MediaFire Downloader*

*Usage:* ${m.prefix}mediafire <mediafire_url>
*Example:* ${m.prefix}mediafire https://www.mediafire.com/file/xxxxx/test.zip`);
        }

        // ලින්ක් එක ක්ලීන් කර ගැනීම
        rawInput = rawInput.replace(/[`']/g, '').trim();
        const mediafireRegex = /(https?:\/\/(?:www\.)?mediafire\.com\/[^\s]+)/;
        const match = rawInput.match(mediafireRegex);

        if (!match) {
            return m.reply("❌ කරුණාකර වලංගු MediaFire ලින්ක් එකක් ලබා දෙන්න මචං!");
        }

        let cleanedUrl = match[0];
        await m.react("⏳");
        await conn.sendPresenceUpdate('composing', from);

        console.log(`[MediaFire] Direct Scrape එකක් පටන් ගන්නවා: ${cleanedUrl}`);

        // 🕵️‍♂️ ක්‍රමය 1: කෙලින්ම MediaFire වෙබ් පිටුවට රික්වෙස්ට් එකක් යවා HTML එක ගන්නවා
        let downloadUrl = null;
        let fileName = "MediaFire_File";
        let fileSize = "Unknown";

        try {
            const pageResponse = await axios.get(cleanedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9'
                },
                timeout: 15000
            });

            const html = pageResponse.data;

            // HTML එක ඇතුලෙන් Direct Download Link එක Regex එකක් මඟින් ඇදලා ගන්නවා
            const dlMatch = html.match(/https?:\/\/download[0-9]+\.mediafire\.com\/[^\s"']+/);
            if (dlMatch) {
                downloadUrl = dlMatch[0];
                console.log(`[MediaFire] Direct Link එක සාර්ථකව හමුවුණා: ${downloadUrl}`);
            }

            // HTML එක ඇතුලෙන් ෆයිල් එකේ නම ගන්නවා
            const nameMatch = html.match(/<div class="filename">([^<]+)<\/div>/) || html.match(/property="og:title" content="([^"]+)"/);
            if (nameMatch) fileName = nameMatch[1].trim();

            // HTML එක ඇතුලෙන් ෆයිල් සයිස් එක ගන්නවා
            const sizeMatch = html.match(/<span>\(([^)]+)\)<\/span>/) || html.match(/class="details">[^<]*<li><span>File size:<\/span><span>([^<]+)<\/span>/);
            if (sizeMatch) fileSize = sizeMatch[1].trim();

        } catch (scrapeError) {
            console.log("[MediaFire] Direct Scrape එක ෆේල් වුණා, Backup API එකට මාරු වෙනවා...");
        }

        // 🛠️ ක්‍රමය 2: කිසිසේත්ම Direct Scrape එක වැඩ නොකලොත් විතරක් ක්‍රියාත්මක වන Backup API එකක්
        if (!downloadUrl) {
            try {
                // දැනට පවතින අලුත්ම සිංහල/පොදු API එකක්
                const backupApi = `https://api.lolhuman.xyz/api/mediafire?apikey=GataDios&url=${encodeURIComponent(cleanedUrl)}`;
                const apiRes = await axios.get(backupApi, { timeout: 15000 });
                
                if (apiRes.data && apiRes.data.result) {
                    downloadUrl = apiRes.data.result.link || apiRes.data.result.url;
                    fileName = apiRes.data.result.filename || fileName;
                    fileSize = apiRes.data.result.size || fileSize;
                    console.log(`[MediaFire] Backup API එක වැඩ කළා!`);
                }
            } catch (apiErr) {
                console.log("[MediaFire] Backup API එකත් ෆේල්!");
            }
        }

        // 📤 ෆයිල් එක WhatsApp එකට යැවීම
        if (downloadUrl) {
            await m.react("📥");

            let caption = `📁 *Ｍᴇᴀᴅɪᴀꜰɪʀᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n`;
            caption += `*🎀 Name:* ${fileName}\n`;
            caption += `*⚖️ Size:* ${fileSize}\n\n`;
            caption += `© 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗I`;

            await m.reply(caption);

            // ෆයිල් එක ඩොකියුමන්ට් එකක් විදිහට සෙන්ඩ් කිරීම
            await conn.sendMessage(from, {
                document: { url: downloadUrl },
                fileName: fileName,
                mimetype: "application/octet-stream"
            }, { quoted: m });

            await m.react("✅");
        } else {
            await m.react("❌");
            m.reply("❌ Ｙᴏᴜʀ ʟɪɴᴋ ᴀʀᴇ ᴅᴇᴀᴅ ᴏʀ ɴᴏᴛ ᴡᴏʀᴋɪɴɢ...");
        }

    } catch (error) {
        console.error("MediaFire Crash Error:", error);
        await m.react("❌");
        m.reply("❌ ᴇʀʀᴏʀ ..ᴘʟᴇᴀꜱ ᴛʀʏ ᴀɢᴀɪɴ ʟᴇᴀᴛᴇʀ..");
    }
});
