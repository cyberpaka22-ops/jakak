const { cmd } = require('../command');
const axios = require('axios');
const FormData = require('form-data');

cmd({
    pattern: "colorize",
    alias: ["color", "🎨"],
    desc: "Add color to black and white images.",
    category: "other",
    react: "🖌️",
    filename: __filename
},
async (conn, mek, m, { from, reply, quoted }) => {
    try {
       
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || '';

        if (!mime.includes('image')) return reply("📸 *𝐏ʟᴇᴀꜱᴇ ʀᴇᴘʟʏ ᴛᴏ ᴀ ʙʟᴀᴄᴋ & ᴡʜɪᴛᴇ ɪᴍᴀɢᴇ..!*");

        const { key } = await conn.sendMessage(from, { text: "🐉 *𝐈ɴɪᴛɪᴀʟɪᴢɪɴɢ ᴄᴏʟᴏʀɪᴢᴇ ...*" }, { quoted: mek });

        
        const mediaBuffer = await q.download();

      
        await conn.sendMessage(from, { text: "📤 *𝐔ᴘʟᴏᴀᴅɪɴɢ ᴛᴏ ꜱᴇʀᴠᴇʀ...*", edit: key });
        
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', mediaBuffer, { filename: 'colorize.jpg' });

        const catboxRes = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: { ...form.getHeaders() }
        });

        const catboxUrl = catboxRes.data.trim();

       
        await conn.sendMessage(from, { text: "🎨 *𝐂ᴏʟᴏʀɪᴢɪɴɢ ɪᴍᴀɢᴇ...*", edit: key });

        const apiRes = await axios.get(`https://www.movanest.xyz/v2/colorize?image_url=${encodeURIComponent(catboxUrl)}`);
        const resData = apiRes.data;

        if (resData && resData.status === true && resData.results?.output_url) {
            const finalImage = resData.results.output_url;

           
            await conn.sendMessage(from, {
                image: { url: finalImage },
                caption: "🎨 *𝐂ᴏʟᴏʀɪᴢᴇᴅ ꜱᴜᴄᴄꜱꜱꜰᴜʟʟʏ..!*\n\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗"
            }, { quoted: mek });

            await conn.sendMessage(from, { text: "✅ *𝐅ɪɴɪꜱʜᴇᴅ*", edit: key });
        } else {
            throw new Error("𝐀ᴘɪ ᴅɪᴅ ɴᴏᴛ ʀᴇᴛᴜʀɴ ᴀ ᴠᴀɪʟᴅ ɪᴍᴀɢᴇ...");
        }

    } catch (e) {
        console.log(e);
        reply("❌ *𝐄ʀʀᴏʀ:* " + e.message);
    }
});
