const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    alias: ["creator", "dev", "contact"],
    desc: "Show bot owner contact",
    react: "👑",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        // Owner details (මෙතන ඔයාගේ details වෙනස් කරන්න)
        const ownerName = "𝒄𝒚𝒃𝒆𝒓 𝒔𝒉𝒂𝒎𝒊𝒚𝒂";
        const ownerNumber = "94766619363"; // country code එක්ක (උදා: 94771234567)
        const botName = "Ｒɪᴋᴀ Ｘᴍᴅ";

        // Contact (vCard) හදනවා
        const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${ownerName}
ORG:${botName};
TEL;type=CELL;type=VOICE;waid=\( {ownerNumber}:+ \){ownerNumber}
END:VCARD`;

        // Contact card එක යවනවා
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: mek });

        // Caption message එක
        const caption = `
╭───〔 *👑 Ｏᴡɴᴇʀ Ｉɴғᴏ* 〕───⬣
│
│  ɴᴀᴍᴇ     : *${ownerName}*
│  ɴᴜᴍʙᴇʀ   : *+${ownerNumber}*
│  ʙᴏᴛ      : *${botName}*
│
│  ᴄᴏɴᴛᴀᴄᴛ ᴄᴀʀᴅ sᴇɴᴛ ᴀʙᴏᴠᴇ ⬆️
│
╰────────────────⬣
> Ｐᴏᴡᴇʀᴇᴅ ʙʏ Ｓʜᴀᴍɪᴋᴀ 🐉
        `.trim();

        await conn.sendMessage(from, {
            text: caption,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363428073031350@newsletter",
                    newsletterName: "Ｒɪᴋᴀ Ｘᴍᴅ"
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Owner contact send කරන්න බැරි වුණා");
    }
});
