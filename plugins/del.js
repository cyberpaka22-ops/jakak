const { cmd } = require('../command')

cmd({
    pattern: "del",
    alias: ["delete", "unsend"],
    desc: "Delete a quoted message without internal admin checks.",
    category: "main",
    react: "✂️",
    filename: __filename
},
async (conn, mek, m, { from, reply }) => {
    try {
        
        if (!m.quoted) return reply("❌ Please reply to the message you want to delete.")

       
        const key = {
            remoteJid: from,
            fromMe: m.quoted.fromMe,
            id: m.quoted.id,
            participant: m.quoted.sender
        }

        
        await conn.sendMessage(from, { delete: key })

    } catch (e) {
       
        console.log("DEL_ERROR:", e)
        reply(`❌ *Error:* * ${e.message}\n\n_(බොට් ඇඩ්මින්ද කියලා හෝ මැසේජ් එක ගොඩක් පරණ එකක්ද කියලා චෙක් කරන්න)_`)
    }
})
