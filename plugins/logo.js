const { cmd } = require('../command');


const logoTypes = ["neon","neon2","fire2","glitch","hacker","futuristic","thunder","devil","fire","ice","snow","lava","metal","gold","silver","glossy","blackpink","transformer","horror","blood","joker","galaxy","space","cloud","sand","stone","magma","gradient","light","paper","watercolor","candy","christmas","luxury","leaf","summer","circuit","block3d","cartoon","chrome","frozen"];


cmd({
    pattern: "logo",
    alias: ["maker", "textpro"],
    use: '.logo <your name>',
    react: "🎨",
    desc: "Create professional logos with 40+ styles",
    category: "Download",
    filename: __filename
},
async(conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply('🎨 *Please provide a name to create a logo!* \n\n*Ex:* .logo Yasas');

        let caption = `╭━━━〔 *𝐑ɪᴋᴀ-xᴍᴅ ᴍɪɴɪ ᴠ1* 〕━━━┈⊷
┃ 🎨 *ʟᴏɢᴏ ᴍᴀᴋᴇʀ*
╰━━━━━━━━━━━━━━━┈⊷

*👤 𝐍𝐚𝐦𝐞 :* ${q}

*🔢 Please reply with a number to select a style:*

`;

        
        let rows = "";
        logoTypes.forEach((type, index) => {
            rows += `*${index + 1} |* ${type.toUpperCase()}\n`;
        });
        
        caption += rows;
        caption += `\n╰━━━━━━━━━━━━━━━┈⊷\n\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

       
        const sentMsg = await conn.sendMessage(from, {
            image: { url: `https://www.ominisave.com/api/logo?name=${encodeURIComponent(q)}&type=neon` },
            caption: caption
        }, { quoted: mek });

       
        const msgId = sentMsg.key.id;
        global.numberStore = global.numberStore || {};
        global.numberStore[msgId] = {};

        
        logoTypes.forEach((type, index) => {
            global.numberStore[msgId][(index + 1).toString()] = `genlogo ${type}&${q}`;
        });

    } catch (e) {
        console.error(e);
        reply('❌ *Error generating logo menu!*');
    }
});


cmd({
    pattern: "genlogo",
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return;

    try {
        
        const style = q.split("&")[0];
        const name = q.split("&")[1];

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        const logoUrl = `https://www.ominisave.com/api/logo?name=${encodeURIComponent(name)}&type=${style}`;

        
        await conn.sendMessage(
            from,
            { 
                image: { url: logoUrl }, 
                caption: `✅ *𝗟𝗢𝗚𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!* \n\n*✨ Style:* ${style.toUpperCase()}\n*👤 Name:* ${name}\n\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗` 
            },
            { quoted: mek }
        );

        await conn.sendMessage(from, { react: { text: '🎨', key: mek.key } });

    } catch (e) {
        console.log(e);
        reply('❌ *Error creating your logo!*');
    }
});
