const config = require('../config');
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const configPath = path.join(__dirname, '../config.js');

// ===============================
// Mongo UserConfig Model (pair.js එකේ තියෙන එකට සමාන)
// ===============================
let UserConfigModel;
try {
    UserConfigModel = mongoose.model('UserConfig');
} catch (e) {
    const UserConfigSchema = new mongoose.Schema({ number: String, config: Object, updatedAt: Date });
    UserConfigModel = mongoose.model('UserConfig', UserConfigSchema);
}

// ===============================
// SAVE CONFIG (File + MongoDB)
// ===============================
async function saveConfig(conn = null) {
    // 1. config.js එකට save
    const newConfig = `module.exports = ${JSON.stringify(config, null, 4)};`;
    fs.writeFileSync(configPath, newConfig);
    delete require.cache[require.resolve('../config')];
    Object.assign(config, require('../config'));

    // 2. MongoDB එකටත් save (bot number එකෙන්)
    try {
        if (conn && conn.user && conn.user.id) {
            const number = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
            await UserConfigModel.findOneAndUpdate(
                { number },
                { number, config: { ...config }, updatedAt: new Date() },
                { upsert: true }
            );
        }
    } catch (e) {
        console.error('Mongo save error:', e.message);
    }
}

// ===============================
// OWNER CHECK
// ===============================
function isOwner(senderNumber, conn) {
    const botNumber = conn.user.id.split(':')[0];
    return (
        senderNumber === config.OWNER_NUMBER ||
        senderNumber === botNumber
    );
}

// ===============================
// AUTO STATUS READ
// ===============================
cmd({
    pattern: 'autostatusread',
    desc: 'Turn Auto Status Read ON/OFF',
    category: 'settings',
    react: '👁️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.AUTO_READ_STATUS ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.autostatusread on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.AUTO_READ_STATUS = true; await saveConfig(conn); return reply('✅ AUTO STATUS READ ENABLED'); }
    if (option === 'off') { config.AUTO_READ_STATUS = false; await saveConfig(conn); return reply('❌ AUTO STATUS READ DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// AUTO REACT (Messages Only)
// ===============================
cmd({
    pattern: 'autoreact',
    desc: 'Turn Auto React (Messages) ON/OFF',
    category: 'settings',
    react: '❤️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status (Messages):\n${config.AUTO_REACT ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.autoreact on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.AUTO_REACT = true; await saveConfig(conn); return reply('✅ AUTO REACT (Messages) ENABLED'); }
    if (option === 'off') { config.AUTO_REACT = false; await saveConfig(conn); return reply('❌ AUTO REACT (Messages) DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// AUTO REACT STATUS (Status Only)
// ===============================
cmd({
    pattern: 'autoreactstatus',
    alias: ['autoreactst', 'statusreact'],
    desc: 'Turn Auto React Status ON/OFF',
    category: 'settings',
    react: '💫'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status React:\n${config.AUTO_LIKE_STATUS ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.autoreactstatus on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.AUTO_LIKE_STATUS = true; await saveConfig(conn); return reply('✅ AUTO REACT STATUS ENABLED'); }
    if (option === 'off') { config.AUTO_LIKE_STATUS = false; await saveConfig(conn); return reply('❌ AUTO REACT STATUS DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// AUTO TYPING
// ===============================
cmd({
    pattern: 'autotyping',
    desc: 'Turn Auto Typing ON/OFF',
    category: 'settings',
    react: '⌨️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.AUTO_TYPING ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.autotyping on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.AUTO_TYPING = true; await saveConfig(conn); return reply('✅ AUTO TYPING ENABLED'); }
    if (option === 'off') { config.AUTO_TYPING = false; await saveConfig(conn); return reply('❌ AUTO TYPING DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// AUTO RECORDING
// ===============================
cmd({
    pattern: 'autorecording',
    desc: 'Turn Auto Recording ON/OFF',
    category: 'settings',
    react: '🎙️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.AUTO_RECORDING ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.autorecording on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.AUTO_RECORDING = true; await saveConfig(conn); return reply('🎙️ AUTO RECORDING ENABLED'); }
    if (option === 'off') { config.AUTO_RECORDING = false; await saveConfig(conn); return reply('🎙️ AUTO RECORDING DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// ANTI LINK
// ===============================
cmd({
    pattern: 'antilink',
    desc: 'Turn Anti Link ON/OFF',
    category: 'settings',
    react: '🔗'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.ANTI_LINK ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.antilink on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.ANTI_LINK = true; await saveConfig(conn); return reply('✅ ANTI LINK ENABLED'); }
    if (option === 'off') { config.ANTI_LINK = false; await saveConfig(conn); return reply('❌ ANTI LINK DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// ANTI BAD
// ===============================
cmd({
    pattern: 'antibad',
    desc: 'Turn Anti Bad Words ON/OFF',
    category: 'settings',
    react: '💬'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.ANTI_BAD ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.antibad on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.ANTI_BAD = true; await saveConfig(conn); return reply('✅ ANTI BAD ENABLED'); }
    if (option === 'off') { config.ANTI_BAD = false; await saveConfig(conn); return reply('❌ ANTI BAD DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// ANTI BOT
// ===============================
cmd({
    pattern: 'antibot',
    desc: 'Turn Anti Bot ON/OFF',
    category: 'settings',
    react: '🤖'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.ANTI_BOT ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.antibot on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.ANTI_BOT = true; await saveConfig(conn); return reply('✅ ANTI BOT ENABLED'); }
    if (option === 'off') { config.ANTI_BOT = false; await saveConfig(conn); return reply('❌ ANTI BOT DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// ALWAYS ONLINE
// ===============================
cmd({
    pattern: 'alwaysonline',
    desc: 'Turn Always Online ON/OFF',
    category: 'settings',
    react: '🌐'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.ALWAYS_ONLINE ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.alwaysonline on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.ALWAYS_ONLINE = true; await saveConfig(conn); return reply('✅ ALWAYS ONLINE ENABLED'); }
    if (option === 'off') { config.ALWAYS_ONLINE = false; await saveConfig(conn); return reply('❌ ALWAYS ONLINE DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// ALWAYS OFFLINE
// ===============================
cmd({
    pattern: 'alwaysoffline',
    desc: 'Turn Always Offline ON/OFF',
    category: 'settings',
    react: '🌙'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.ALWAYS_OFFLINE ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.alwaysoffline on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.ALWAYS_OFFLINE = true; await saveConfig(conn); return reply('✅ ALWAYS OFFLINE ENABLED'); }
    if (option === 'off') { config.ALWAYS_OFFLINE = false; await saveConfig(conn); return reply('❌ ALWAYS OFFLINE DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// READ CMD ONLY
// ===============================
cmd({
    pattern: 'readcmdonly',
    desc: 'Read Commands Only ON/OFF',
    category: 'settings',
    react: '📖'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Status:\n${config.READ_CMD_ONLY ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.readcmdonly on`);
    const option = args[0].toLowerCase();
    if (option === 'on') { config.READ_CMD_ONLY = true; await saveConfig(conn); return reply('✅ READ CMD ONLY ENABLED'); }
    if (option === 'off') { config.READ_CMD_ONLY = false; await saveConfig(conn); return reply('❌ READ CMD ONLY DISABLED'); }
    reply('Use ON or OFF');
});

// ===============================
// PREFIX CHANGE
// ===============================
cmd({
    pattern: 'setprefix',
    desc: 'Change Bot Prefix',
    category: 'settings',
    react: '⚙️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Prefix:\n${config.PREFIX}\n\nExample:\n.setprefix .`);
    config.PREFIX = args[0];
    await saveConfig(conn);
    reply(`✅ PREFIX CHANGED TO ${args[0]}`);
});

// ===============================
// MODE CHANGE
// ===============================
cmd({
    pattern: 'mode',
    desc: 'Change Bot Mode',
    category: 'settings',
    react: '🛡️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Mode:\n${config.WORK_TYPE}\n\nModes:\npublic | private | inbox | groups`);
    const mode = args[0].toLowerCase();
    const allowed = ['public', 'private', 'inbox', 'groups'];
    if (!allowed.includes(mode)) return reply('❌ INVALID MODE');
    config.WORK_TYPE = mode;
    await saveConfig(conn);
    reply(`✅ MODE CHANGED TO ${mode}`);
});

// ===============================
// SETTINGS VIEW
// ===============================
cmd({
    pattern: 'settings',
    alias: ['setting', 'set'],
    desc: 'Show Bot Settings',
    category: 'settings',
    react: '⚡'
},
async (conn, mek, m, { from, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');

    const status = (val) => val === true ? 'ON ✅' : 'OFF ❌';

    const settingsText = `
╭───〔 *⚙️ ${config.BOT_NAME} ꜱᴇᴛᴛɪɴɢꜱ* 〕───⬣
│
│ ◈ *Ｐʀᴇꜰɪx*: [${config.PREFIX}]
⌥ .setprefix .
│ ◈ *Ｍᴏᴅᴇ*: ${config.WORK_TYPE}
⌥ .mode private / public / inbox
│ ◈ *Ｏᴡɴᴇʀ*: ${config.OWNER_NUMBER}
│
│ *🎙️ Ａᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ*: ${status(config.AUTO_RECORDING)}
⌥ .autorecording on / off
│ *⌨️ Ａᴜᴛᴏ ᴛʏᴘɪɴɢ*: ${status(config.AUTO_TYPING)}
⌥ .autotyping on / off
│ *👁️ Ａᴜᴛᴏ ꜱᴛᴀᴛᴜꜱ ʀᴇᴀᴅ*: ${status(config.AUTO_READ_STATUS)}
⌥ .autostatusread on / off
│ *❤️ Ａᴜᴛᴏ ʀᴇᴀᴄᴛ*: ${status(config.AUTO_REACT)}
⌥ .autoreact on / off
│ *💫 Ａᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴀᴛᴜs*: ${status(config.AUTO_LIKE_STATUS)}
⌥ .autoreactstatus on / off
│ *🔗 Ａɴᴛɪ ʟɪɴᴋ*: ${status(config.ANTI_LINK)}
⌥ .antilink on / off
│ *🤖 Ａɴᴛɪ ʙᴏᴛ*: ${status(config.ANTI_BOT)}
⌥ .antibot on / off
│ *💬 Ａɴᴛɪ ʙᴀᴅ*: ${status(config.ANTI_BAD)}
⌥ .antibad on / off
│ *🌐 Ａʟᴡᴀʏꜱ ᴏɴʟɪɴᴇ*: ${status(config.ALWAYS_ONLINE)}
⌥ .alwaysonline on / off
│ *🌙 Ａʟᴡᴀʏꜱ ᴏꜰꜰʟɪɴᴇ*: ${status(config.ALWAYS_OFFLINE)}
⌥ .alwaysoffline on / off
│ *📖 Ｒᴇᴀᴅ ᴄᴍᴅ ᴏɴʟʏ*: ${status(config.READ_CMD_ONLY)}
⌥ .readcmdonly on / off
│
> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗
╰────────────────⬣
`;

    const channelJid = "120363428073031350@newsletter";
    const channelName = "Ｒɪᴋᴀ xᴍᴅ ꜱᴇᴛᴛɪɴɢꜱ 🐉";

    try {
        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/wZrNj38d/6fecc5463333.jpg" },
            caption: settingsText,
            footer: "> ＰᴏᴡᴇʀᴇᴅＢʏ ＳʜᴀᴍɪᴋᴀＤᴇɴᴜᴡᴀɴ 🐉",
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: channelName
                }
            }
        }, { quoted: mek });
    } catch (e) {
        console.log("Settings Image Error:", e.message);
        await conn.sendMessage(from, {
            text: settingsText,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: channelJid,
                    newsletterName: channelName
                }
            }
        }, { quoted: mek });
    }
});
