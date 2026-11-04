const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "removebg",
    alias: ["rbg", "bgremove"],
    desc: "Remove the background of an image.",
    category: "image",
    react: "✂️",
    filename: __filename
},
async (conn, mek, m, { from, reply, quoted }) => {
    try {
        
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';
        
        if (!mime.startsWith('image/')) return reply("🚫 *𝐑ᴇᴘʟᴀʏ ᴛᴏ ᴀɴ ɪᴍᴀɢᴇ.*");

       
        const { key } = await conn.sendMessage(from, { text: "🖌️ *𝐀ɴᴀʟʏᴢɪɴɢ ɪᴍᴀɢᴇ...*" }, { quoted: mek });

      
        let media = await q.download();

       
        await conn.sendMessage(from, { text: "⬆️ *𝗨𝗽𝗹𝗼𝗮𝗱𝗶𝗻𝗴 𝘁𝗼 𝗖𝗹𝗼𝘂𝗱...*", edit: key });
        
        const form = new FormData();
        form.append("reqtype", "fileupload");
        form.append("fileToUpload", media, "image.jpg");

        const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
            headers: form.getHeaders()
        });
        
        const imageUrl = uploadRes.data.trim();

        
        await conn.sendMessage(from, { text: "✂️ *𝐑ᴇᴍᴏᴠɪɴɢ ʙᴀᴄᴋɢʀᴏᴜɴᴅ..'..*", edit: key });

        const apiUrl = `https://www.movanest.xyz/v2/removebg?image_url=${encodeURIComponent(imageUrl)}`;
        const rbgResponse = await axios.get(apiUrl, { responseType: 'arraybuffer' });

       
        await conn.sendMessage(from, { 
            image: rbgResponse.data, 
            caption: "✅ *𝗥𝗘𝗠𝗢𝗩𝗘𝗕𝗚 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬!*\n\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗" 
        }, { quoted: mek });

        await conn.sendMessage(from, { text: "✨ *𝐏ʀᴏᴄᴇꜱꜱ ᴄᴏᴍᴘʟᴇᴛᴇᴅ..!*", edit: key });

    } catch (e) {
        console.log(e);
        reply("❌ *𝗘𝗿𝗿𝗼𝗿:* " + e.message);
    }
});
