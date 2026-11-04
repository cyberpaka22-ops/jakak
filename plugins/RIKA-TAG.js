const { cmd } = require("../command");

cmd({
    pattern: "tagall",
    alias: ["all", "everyone"],
    desc: "Mention all group members",
    category: "group",
    filename: __filename
},
async (conn, m, msg, {
    isGroup,
    participants,
    isAdmins,
    isOwner,
    reply
}) => {

    if (!isGroup) return reply("❌ This command works only in groups.");
    if (!isAdmins && !isOwner) return reply("❌ Admin only.");

    let text = "*👥 𝐑𝐈𝐊𝐀 𝐓𝐀𝐆 𝐀𝐋𝐋*\n\n";
    let mentions = [];

    for (let mem of participants) {
        mentions.push(mem.id);
        text += `➤ @${mem.id.split("@")[0]}\n`;
    }

    await conn.sendMessage(
        m.chat,
        {
            text,
            mentions
        },
        { quoted: m }
    );

});

cmd({
    pattern: "hidetag",
    alias: ["htag"],
    desc: "Hidden tag message",
    category: "group",
    filename: __filename
},
async (conn, m, msg, {
    isGroup,
    participants,
    isAdmins,
    isOwner,
    q,
    reply
}) => {

    if (!isGroup) return reply("❌ This command works only in groups.");
    if (!isAdmins && !isOwner) return reply("❌ Admin only.");

    if (!q) return reply("Example:\n.hidetag Hello Everyone");

    let mentions = participants.map(v => v.id);

    await conn.sendMessage(
        m.chat,
        {
            text: q,
            mentions
        },
        { quoted: m }
    );

});
