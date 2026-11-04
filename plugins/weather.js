const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "weather",
    alias: ["w", "temp"],
    desc: "City එකක weather බලන්න",
    category: "info",
    react: "🌤️",
    filename: __filename
},
async(conn, mek, m, { from, reply, q }) => {
    if (!q) return reply("*𝐔sᴀɢᴇ :.ᴡᴇᴀᴛʜᴇʀ <ᴄɪᴛʏ_ɴᴀᴍᴇ>*\n\n𝐄x :.ᴡᴇᴀᴛʜᴇʀ ᴄᴏʟᴏᴍʙᴏ");

    try {
        reply("*𝐅ᴇᴛᴄʜɪɴɢ ᴡᴇᴀᴛʜᴇʀ... ⏳*");
        
        // wttr.in API - key ඕනේ නෑ
        const res = await axios.get(`https://wttr.in/${encodeURIComponent(q)}?format=j1`);
        const data = res.data.current_condition[0];
        const area = res.data.nearest_area[0];

        const text = `╭─── « 𝐖ᴇᴀᴛʜᴇʀ 𝐔ᴘᴅᴀᴛᴇ » ───⟡
│
│ ⊳ 𝐂ɪᴛʏ : ${area.areaName[0].value}, ${area.country[0].value}
│ ⊳ 𝐓ᴇᴍᴘ : ${data.temp_C}°C / ${data.temp_F}°F
│ ⊳ 𝐅ᴇʟs : ${data.FeelsLikeC}°C
│ ⊳ 𝐇ᴜᴍɪᴅɪᴛʏ : ${data.humidity}%
│ ⊳ 𝐖ɪɴᴅ : ${data.windspeedKmph} km/h
│ ⊳ 𝐒ᴛᴀᴛᴜs : ${data.weatherDesc[0].value}
│ ⊳ 𝐕ɪsɪʙɪʟɪᴛʏ : ${data.visibility} km
│
╰───────────────⟡
© 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

        reply(text);
    } catch (e) {
        console.error(e);
        reply("*𝐂ɪᴛʏ 𝐍ᴏᴛ 𝐅ᴏᴜɴᴅ*\n\n𝐂ʜᴇᴄᴋ ᴛʜᴇ sᴘᴇʟɪɴɢ ᴏʀ ᴛʀʏ ᴇɴɢʟɪsʜ ɴᴀᴍᴇ");
    }
});
