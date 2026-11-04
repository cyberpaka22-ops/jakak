const { cmd } = require('../command');

// යූසර් දෙන දත්ත ටික එකතු කරගන්න ෆන්ක්ෂන් එක
function getQuery(args) {
    if (!args) return "";
    if (Array.isArray(args)) return args.join(" ").trim();
    if (typeof args === "string") return args.trim();
    if (typeof args === "object") return Object.values(args).join(" ").trim();
    return "";
}

cmd({
    pattern: "boom",
    alias: ["bomb", "spam", "mass"],
    category: "tools",
    fromMe: false,
    desc: "💥 එකම මැසේජ් එක ගොඩක් වෙලාවට යවන්න (Text Bomber)"
}, async (conn, mek, m, { from, q, isOwner, reply, prefix, pushname, sessionId }) => {
    const args = q;
    try {
        let input = getQuery(args);
        
        if (!input) {
            return m.reply(`💥 *Boom / Text Bomber*

*Usage:* ${m.prefix}boom <text> , <count>  (හෝ | පාවිච්චි කරන්න)
*Example:* ${m.prefix}boom ටෙස්ට් බොම්බ් , 10`);
        }

        // 💡 මෙතනදී [|, ] Regex එක පාවිච්චි කරලා | හෝ , ලකුණු දෙකෙන්ම වෙන් කරන්න පුළුවන් කලා
        let parts = input.split(/[|,]/);
        let text = parts[0]?.trim();
        let count = parts[1]?.trim();
        
        if (!text || !count) {
            return m.reply("❌ කරුණාකර ටෙක්ස්ට් එක සහ ප්‍රමාණය `,` හෝ `|` ලකුණෙන් වෙන් කරලා දෙන්න!\n\n💡 උදාහරණ: `.boom හලෝ මචං , 5` ");
        }

        count = parseInt(count);

        if (isNaN(count) || count <= 0) {
            return m.reply("❌ කරුණාකර ප්‍රමාණය සඳහා නිවැරදි අංකයක් ලබා දෙන්න!");
        }
        
        // WhatsApp Ban එකෙන් බේරෙන්න උපරිම සීමාව
        if (count > 3000) {
            return m.reply("⚠️ එක පාරට ගොඩක් යැව්වොත් WhatsApp එකෙන් බොට්ව Ban වෙන්න පුළුවන් මචං. ඒ නිසා එක පාරකට උපරිම 15ක් විතරක් දාන්න!");
        }

        await m.react("💥");

        // මැසේජ් ටික එකින් එක යනවා
        for (let i = 0; i < count; i++) {
            await conn.sendMessage(from, { text: text });
            
            // සේෆ්ටි එකට තත්පර බාගයක විරාමයක්
            await new Promise(resolve => setTimeout(resolve, 200));
        }

    } catch (e) {
        console.error("Boom Command Error:", e);
        m.reply("❌ Error එකක් ආවා මචං!");
    }
});
