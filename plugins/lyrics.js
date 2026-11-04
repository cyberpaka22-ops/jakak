const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "lyrics",
    alias: ["lyric"],
    desc: "Song lyrics ගන්න",
    category: "search",
    react: "🎵",
    filename: __filename
},
async(conn, mek, m, { from, reply, q }) => {
    if (!q) return reply("*𝐔sᴀɢᴇ :.ʟʏʀɪᴄs <sᴏɴɢ_ɴᴀᴍᴇ>*\n\n𝐄x :.ʟʏʀɪᴄs ʙɪʟɪᴇ ᴇɪʟɪsʜ");

    try {
        reply("*𝐒ᴇᴀʀᴄʜɪɴɢ ʟʏʀɪᴄs... ⏳*");
        
        // Popcat API - more reliable
        const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${encodeURIComponent(q)}`);
        const data = res.data;
        
        if (!data.lyrics || data.error) return reply("*𝐋ʏʀɪᴄs 𝐍ᴏᴛ 𝐅ᴏᴜɴᴅ*");

        let lyrics = data.lyrics;
        if (lyrics.length > 1500) lyrics = lyrics.slice(0, 1500) + "\n\n*...ᴛʀᴜɴᴄᴀᴛᴇᴅ*";

        const text = `╭─── « 𝐋ʏʀɪᴄs » ───⟡
│
│ *𝐓ɪᴛʟᴇ :* ${data.title}
│ *𝐀ʀᴛɪsᴛ :* ${data.artist}
│
${lyrics}
╰───────────────⟡`;

        reply(text);
    } catch (e) {
        console.error(e);
        reply("*𝐋ʏʀɪᴄs 𝐍ᴏᴛ 𝐅ᴏᴜɴᴅ*\n\n*ᴛʀʏ ᴇɴɢʟɪsʜ sᴏɴɢ ɴᴀᴍᴇ*");
    }
});
