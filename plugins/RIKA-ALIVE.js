const { cmd } = require('../command');
const config = require('../config')

cmd({
    pattern: "alive",
    desc: "Check bot status",
    react: "🤖",
    category: "main",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {

    try {
        const aliveText = `
╭───〔 *🤖 Ｒɪᴋᴀ Ｘᴍᴅ* 〕───⬣
│
│ \`Ｈᴇʏ ..👋 Ｉ'ᴍ Ａʟɪᴠᴇ Ｎᴏᴡ\`
│◈ ⚙️ Ｐʀᴇꜰɪx: *[${config.PREFIX}]*
│◈ 🦅 Ｓᴛᴀᴛᴜꜱ: *Online ✅*
│◈ 🧸 Ｍᴏᴅᴇ : *Public 🌐*
│◈ 🐉 Ｏᴡɴᴇʀ : *Shamika 😎*
│
│ \`● ᴛʜᴇ ʙᴇꜱᴛ ᴡʜᴀᴛꜱᴀᴘ ʙᴏᴛ ❗\`
│ \`● ᴛʜᴇ ᴍᴜʟᴛɪᴘʟᴇ ᴡʜᴀᴛꜱᴀᴘ ʙᴏᴛ ❗\`
│ \`● ʀɪᴋᴀ ᴛᴇᴀᴄʜ ᴡᴘ ᴍᴅ ʙᴏᴛ ❗\`
│ 
│ Type \`.menu\` for commands
│
╰────────────────⬣
`;

        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/ycY7Nyg6/4f7c2504e62e.jpg" },
            caption: aliveText,
            footer: "> ＰᴏᴡᴇʀᴇᴅＢʏ ＳʜᴀᴍɪᴋᴀＤᴅᴇɴᴜᴡᴀɴ 🐉",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363428073031350@newsletter",
                    newsletterName: "Ｒɪᴋᴀ ᴛᴇᴀᴄʜ ᴏꜰ ʙᴏᴛ ᴀʟɪᴠᴇ 🐉"
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ Error in alive command");
    }

});
