// commands/getdp.js
const { cmd } = require('../command');
const axios = require("axios");

// Cache: store { url, timestamp } for each number
if (!global.dpCache) global.dpCache = new Map();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

cmd({
    pattern: "getdp",
    alias: ["dp", "getprofile"],
    category: "tools",
    fromMe: false,
    desc: "📸 Get WhatsApp profile picture, name, and about"
}, async (conn, mek, m, { from, q, isOwner, reply, prefix, pushname, sessionId }) => {
    const args = q;
    let fullInput = (args && Array.isArray(args)) ? args.join('') : (args || '');
    if (!fullInput && m.text) {
        let withoutCmd = m.text.replace(/^[.\/#!]?getdp/i, '').trim();
        fullInput = withoutCmd.replace(/\s/g, '');
    }
    let number = fullInput.replace(/\D/g, '');
    
    if (!number || number.length < 10) {
        return m.reply(`📸 *Profile Fetcher*

*Usage:* .getdp 94766619362
*Example:* .getdp 94766619363`);
    }

    let jid = number + '@s.whatsapp.net';
    await m.react("⏳");
    await conn.sendPresenceUpdate('composing', from);
    await m.reply(`🔍 Fetching profile for ${number}...`);

    try {
        // 1. Check existence
        const [exists] = await conn.onWhatsApp(jid);
        if (!exists || !exists.exists) {
            await m.react("❌");
            return m.reply(`❌ Number ${number} not on WhatsApp.`);
        }

        // 2. Get contact name
        let name = number;
        try {
            const contact = await conn.contact[jid];
            if (contact && contact.name) name = contact.name;
            else if (contact && contact.notify) name = contact.notify;
        } catch(e) {}

        // 3. Get about status
        let about = 'Not available';
        try {
            const status = await conn.fetchStatus(jid);
            if (status && status.status) about = status.status;
        } catch(e) { about = 'Not available (Privacy)'; }

        // 4. Get profile picture – with cache and retry
        let ppUrl = null;
        let now = Date.now();
        let cached = global.dpCache.get(number);
        if (cached && (now - cached.timestamp) < CACHE_TTL) {
            ppUrl = cached.url;
        } else {
            // Attempt to fetch (HD then preview)
            for (let attempt = 0; attempt < 2; attempt++) {
                try {
                    ppUrl = await conn.profilePictureUrl(jid, 'image');
                    break;
                } catch (err) {
                    try {
                        ppUrl = await conn.profilePictureUrl(jid, 'preview');
                        break;
                    } catch (err2) {
                        if (attempt === 0) await delay(1500); // wait before retry
                    }
                }
            }
            // Cache even if null (to avoid spamming)
            global.dpCache.set(number, { url: ppUrl, timestamp: now });
        }

        // Clear cache after 5 minutes (already handled)
        setTimeout(() => global.dpCache.delete(number), CACHE_TTL);

        let caption = `📸 *WhatsApp Profile*\n\n📞 *${number}*\n👤 *${name}*\n📝 *About:* ${about}\n\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        if (ppUrl) {
            // Download image with axios to avoid extra API calls
            try {
                const imgRes = await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 });
                const buffer = Buffer.from(imgRes.data);
                await conn.sendMessage(from, { image: buffer, caption: caption }, { quoted: m });
            } catch (imgErr) {
                // fallback: send URL as text
                await conn.sendMessage(from, { text: `${caption}\n\n🖼️ Profile picture URL (copy to browser):\n${ppUrl}` }, { quoted: m });
            }
        } else {
            await conn.sendMessage(from, { text: `🖼️ *No profile picture*\n\n${caption}` }, { quoted: m });
        }
        await m.react("✅");
    } catch (error) {
        console.error("GetDP error:", error);
        await m.react("❌");
        let errMsg = `❌ Failed: ${error.message.substring(0, 150)}`;
        if (error.message.includes('rate') || error.message.includes('too many')) {
            errMsg += `\n\n⏳ WhatsApp is rate‑limiting. Please wait 1–2 minutes and try again.`;
        }
        await m.reply(errMsg);
    }
});
