const config = require('../config');
const { cmd } = require('../command');
const mongoose = require('mongoose');

// ===============================
// Mongo UserConfig Model
// ===============================
let UserConfigModel;
try {
    UserConfigModel = mongoose.model('UserConfig');
} catch (e) {
    const UserConfigSchema = new mongoose.Schema({ number: String, config: Object, updatedAt: Date });
    UserConfigModel = mongoose.model('UserConfig', UserConfigSchema);
}

// ===============================
// SAVE - File overwrite karanne NA, MongoDB witharak + Cache clear
// ===============================
async function saveConfig(conn, key, value) {
    try {
        if (!conn || !conn.user || !conn.user.id) return false;
        const number = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
        const doc = await UserConfigModel.findOne({ number }).lean();
        let userConf = doc ? (doc.config || {}) : {};
        userConf[key] = value;

        await UserConfigModel.findOneAndUpdate(
            { number },
            { number, config: userConf, updatedAt: new Date() },
            { upsert: true }
        );

        config[key] = value;

        if (global.configCache) {
            global.configCache.delete(number);
            global.configCache.delete(conn.user.id.split(':')[0]);
        }
        return true;
    } catch (e) {
        console.error('Mongo save error:', e.message);
        return false;
    }
}

async function getUserConfig(conn) {
    try {
        const number = conn.user.id.split(':')[0].replace(/[^0-9]/g, '');
        if (global.configCache && global.configCache.has(number)) return global.configCache.get(number);
        const doc = await UserConfigModel.findOne({ number }).lean();
        const userConf = doc ? (doc.config || {}) : {};
        return { ...config, ...userConf };
    } catch (e) {
        return config;
    }
}

function isOwner(senderNumber, conn) {
    const botNumber = conn.user.id.split(':')[0];
    return senderNumber === config.OWNER_NUMBER || senderNumber === botNumber;
}

// ===============================
// NUMBER REPLY SETTINGS - RIKA XMD
// ===============================
const NUMBER_SETTINGS = [
    { id: '1', name: 'Always Online', key: 'ALWAYS_ONLINE' },
    { id: '2', name: 'Msg Auto Read', key: 'AUTO_READ' },
    { id: '3', name: 'Auto Typing', key: 'AUTO_TYPING' },
    { id: '4', name: 'Auto React', key: 'AUTO_REACT' },
    { id: '5', name: 'Channel React', key: 'AUTO_LIKE_STATUS' },
    { id: '6', name: 'Anti Delete Group (Same Chat)', key: 'ANTI_DELETE_GROUP' },
    { id: '7', name: 'Anti Delete Inbox (Same Chat)', key: 'ANTI_DELETE_INBOX' },
    { id: '8', name: 'Status Delete', key: 'STATUS_DELETE' },
    { id: '9', name: 'Group Welcome', key: 'GROUP_WELCOME' },
    { id: '10', name: 'Auto Recording', key: 'AUTO_RECORDING' },
    { id: '11', name: 'Auto Bio', key: 'AUTO_BIO' },
    { id: '12', name: 'Always Offline', key: 'ALWAYS_OFFLINE' },
    { id: '13', name: 'Anti Link', key: 'ANTI_LINK' },
    { id: '14', name: 'Anti Bad', key: 'ANTI_BAD' },
    { id: '15', name: 'Auto Status Read', key: 'AUTO_READ_STATUS' },
];

function makeToggleCmd(pattern, key, label, emoji) {
    cmd({
        pattern: pattern,
        desc: `Turn ${label} ON/OFF`,
        category: 'settings',
        react: emoji
    },
    async (conn, mek, m, { args, reply, senderNumber }) => {
        if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
        const userConf = await getUserConfig(conn);
        if (!args[0]) return reply(`Current Status:\n${userConf[key] ? 'ON ✅' : 'OFF ❌'}\n\nExample:\n.${pattern} on`);
        const option = args[0].toLowerCase();
        if (option === 'on') { await saveConfig(conn, key, true); return reply(`✅ ${label} ENABLED`); }
        if (option === 'off') { await saveConfig(conn, key, false); return reply(`❌ ${label} DISABLED`); }
        reply('Use ON or OFF');
    });
}

makeToggleCmd('autostatusread', 'AUTO_READ_STATUS', 'AUTO STATUS READ', '👁️');
makeToggleCmd('autoreact', 'AUTO_REACT', 'AUTO REACT (Messages)', '❤️');
makeToggleCmd('autoreactstatus', 'AUTO_LIKE_STATUS', 'AUTO REACT STATUS', '💫');
makeToggleCmd('autotyping', 'AUTO_TYPING', 'AUTO TYPING', '⌨️');
makeToggleCmd('autorecording', 'AUTO_RECORDING', 'AUTO RECORDING', '🎙️');
makeToggleCmd('antilink', 'ANTI_LINK', 'ANTI LINK', '🔗');
makeToggleCmd('antibad', 'ANTI_BAD', 'ANTI BAD', '💬');
makeToggleCmd('antibot', 'ANTI_BOT', 'ANTI BOT', '🤖');
makeToggleCmd('alwaysonline', 'ALWAYS_ONLINE', 'ALWAYS ONLINE', '🌐');
makeToggleCmd('alwaysoffline', 'ALWAYS_OFFLINE', 'ALWAYS OFFLINE', '🌙');
makeToggleCmd('readcmdonly', 'READ_CMD_ONLY', 'READ CMD ONLY', '📖');

cmd({
    pattern: 'setprefix',
    desc: 'Change Bot Prefix',
    category: 'settings',
    react: '⚙️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    if (!args[0]) return reply(`Current Prefix:\n${config.PREFIX}\n\nExample:\n.setprefix .`);
    await saveConfig(conn, 'PREFIX', args[0]);
    reply(`✅ PREFIX CHANGED TO ${args[0]}`);
});

cmd({
    pattern: 'mode',
    desc: 'Change Bot Mode',
    category: 'settings',
    react: '🛡️'
},
async (conn, mek, m, { args, reply, senderNumber }) => {
    if (!isOwner(senderNumber, conn)) return reply('❌ OWNER ONLY');
    const userConf = await getUserConfig(conn);
    if (!args[0]) return reply(`Current Mode:\n${userConf.WORK_TYPE}\n\nModes:\npublic | private | inbox | groups`);
    const mode = args[0].toLowerCase();
    const allowed = ['public', 'private', 'inbox', 'groups'];
    if (!allowed.includes(mode)) return reply('❌ INVALID MODE');
    await saveConfig(conn, 'WORK_TYPE', mode);
    reply(`✅ MODE CHANGED TO ${mode}`);
});

// ===============================
// SETTINGS VIEW - RIKA XMD - Oya photo eke widiyata
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
    const userConf = await getUserConfig(conn);
    const status = (val) => val === true ? 'ON ✅' : 'OFF ❌';

    const settingsText = `🐉 *RIKA-XMD SETTINGS* ⚙️\n\n* Reply This Number Change To Settings ⬇️\n\n` +
    `"1 Always Online ⬇️"\n1.0 On ✅\n1.1 Off ❌\n\n` +
    `"2 Msg Auto Read ⬇️"\n2.0 On ✅\n2.1 Off ❌\n\n` +
    `"3 Auto Typing ⬇️"\n3.0 On ✅\n3.1 Off ❌\n\n` +
    `"4 Auto React ⬇️"\n4.0 On ✅\n4.1 Off ❌\n\n` +
    `"5 Channel React ⬇️"\n5.0 On ✅\n5.1 Off ❌\n\n` +
    `"6 Anti Delete Group (Same Chat) ⬇️"\n6.0 On ✅\n6.1 Off ❌\n\n` +
    `"7 Anti Delete Inbox (Same Chat) ⬇️"\n7.0 On ✅\n7.1 Off ❌\n\n` +
    `"8 Status Delete ⬇️"\n8.0 On ✅\n8.1 Off ❌\n\n` +
    `"9 Group Welcome ⬇️"\n9.0 On ✅\n9.1 Off ❌\n\n` +
    `╭───〔 *⚙️ 𝐑ɪᴋᴀ xᴍᴅ ꜱᴇᴛᴛɪɴɢꜱ* 〕───⬣\n` +
    `│ ◈ *Ｐʀᴇꜰɪx*: [${userConf.PREFIX}]\n` +
    `│ ◈ *Ｍᴏᴅᴇ*: ${userConf.WORK_TYPE}\n` +
    `│ *🎙️ Auto Recording*: ${status(userConf.AUTO_RECORDING)}\n` +
    `│ *⌨️ Auto Typing*: ${status(userConf.AUTO_TYPING)}\n` +
    `│ *👁️ Auto Status Read*: ${status(userConf.AUTO_READ_STATUS)}\n` +
    `│ *❤️ Auto React*: ${status(userConf.AUTO_REACT)}\n` +
    `│ *💫 Auto React Status*: ${status(userConf.AUTO_LIKE_STATUS)}\n` +
    `│ *🔗 Anti Link*: ${status(userConf.ANTI_LINK)}\n` +
    `│ *🤖 Anti Bot*: ${status(userConf.ANTI_BOT)}\n` +
    `│ *💬 Anti Bad*: ${status(userConf.ANTI_BAD)}\n` +
    `│ *🌐 Always Online*: ${status(userConf.ALWAYS_ONLINE)}\n` +
    `│ *🌙 Always Offline*: ${status(userConf.ALWAYS_OFFLINE)}\n` +
    `╰────────────────⬣\n> © 𝐏ᴏᴡᴇʀᴅ ʙʏ ꜱʜᴀᴍɪᴋᴀ ᴅᴇɴᴜᴡᴀɴ ❗`;

    const channelJid = "120363428073031350@newsletter";
    const channelName = "Ｒɪᴋᴀ xᴍᴅ ꜱᴇᴛᴛɪɴɢꜱ 🐉";
    try {
        await conn.sendMessage(from, {
            image: { url: "https://i.ibb.co/ZqSp2Ff/0b46628be955.jpg" },
            caption: settingsText,
            contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelJid, newsletterName: channelName } }
        }, { quoted: mek });
    } catch (e) {
        await conn.sendMessage(from, { text: settingsText }, { quoted: mek });
    }
});

// ===============================
// NUMBER REPLY HANDLER - 1.0 / 1.1
// ===============================
cmd({
    pattern: 'reply-setting-handler',
    on: 'body',
    dontAddCommandList: true,
    category: 'settings'
},
async (conn, mek, m, { from, body, reply, senderNumber }) => {
    if (!body) return;
    if (!isOwner(senderNumber, conn)) return;
    const match = body.trim().match(/^(\d+)\.([01])$/);
    if (!match) return;
    const settingId = match[1];
    const value = match[2] === '0' ? true : false;
    const found = NUMBER_SETTINGS.find(s => s.id === settingId);
    if (!found) return;
    const ok = await saveConfig(conn, found.key, value);
    if (ok) {
        await reply(`✅ *Setting Updated!*\n\n*${found.name}* : ${value ? 'ON ✅' : 'OFF ❌'}\n*Saved To:* MongoDB ✅\n*Key:* \`${found.key}\`\n\n> 𝐑ɪᴋᴀ xᴍᴅ`);
    } else {
        await reply('❌ Save wenne naa, MongoDB error!');
    }
});
