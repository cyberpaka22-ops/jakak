const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const pino = require('pino');
const config = require('./config');
const axios = require('axios');
const mongoose = require('mongoose');
const moment = require('moment-timezone'); 
const Jimp = require('jimp'); 

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    downloadContentFromMessage,
    proto,
    prepareWAMessageMedia,
    Browsers,
    generateWAMessageFromContent,
    generateForwardMessageContent,
    S_WHATSAPP_NET
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, fetchJson } = require('./lib/functions');
const { sms } = require('./lib/msg');
const NodeCache = require('node-cache');
const util = require('util');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_BASE_PATH = './sessions';
const msgRetryCounterCache = new NodeCache();

require('events').EventEmitter.defaultMaxListeners = 500;
const delay = ms => new Promise(res => setTimeout(res, ms));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pakexmd_db_user:I8hYtO6bPiuyuosb@rikado.cf4ymu3.mongodb.net/botdb?retryWrites=true&w=majority&appName=rikado';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('𝐌ᴏɴɢᴏ𝐃𝐁 𝐂ᴏɴɴᴇᴄᴛᴇᴅ ✅ '))
    .catch(err => console.log('❌ 𝐌ᴏɴɢᴏ𝐃𝐁 ᴇʀʀᴏ:', err));

const SessionSchema = new mongoose.Schema({ sessionId: String, data: Object });
const Session = mongoose.model('fgfgfgdfgdfd', SessionSchema);
const UserConfigSchema = new mongoose.Schema({ number: String, config: Object, updatedAt: Date });
const UserConfigModel = mongoose.model('UserConfig', UserConfigSchema);
const NewsletterReactSchema = new mongoose.Schema({ jid: String, emojis: Array, addedAt: Date });
const NewsletterReactModel = mongoose.model('NewsletterReact', NewsletterReactSchema);

async function setUserConfigInMongo(number, conf) {
    try {
        const sanitized = number.replace(/[^0-9]/g, '');
        await UserConfigModel.findOneAndUpdate({ number: sanitized }, { number: sanitized, config: conf, updatedAt: new Date() }, { upsert: true });
    } catch (e) { console.error('setUserConfigInMongo Error:', e); }
}
async function loadUserConfigFromMongo(number) {
    try {
        const sanitized = number.replace(/[^0-9]/g, '');
        const doc = await UserConfigModel.findOne({ number: sanitized });
        return doc ? doc.config : null;
    } catch (e) { console.error('loadUserConfigFromMongo Error:', e); return null; }
}
async function addNewsletterReactConfig(jid, emojis = []) {
    try {
        await NewsletterReactModel.findOneAndUpdate({ jid }, { jid, emojis, addedAt: new Date() }, { upsert: true });
        console.log(`Added react-config for ${jid}`);
    } catch (e) { console.error('addNewsletterReactConfig', e); }
}
async function listNewsletterReactsFromMongo() {
    try {
        const docs = await NewsletterReactModel.find({});
        return docs.map(d => ({ jid: d.jid, emojis: Array.isArray(d.emojis) ? d.emojis : [] }));
    } catch (e) { return []; }
}

const BOT_NAME_FANCY = config.BOT_NAME || "RIKA XMD V1";
function formatMessage(title, content, footer) { return `*${title}*\n\n${content}\n\n> *${footer}*`; }
function generateOTP(){ return Math.floor(100000 + Math.random() * 900000).toString(); }
function getSriLankaTimestamp(){ return moment().tz('Asia/Colombo').format('YYYY-MM-DD HH:mm:ss'); }
async function resize(image, width, height) {
    let oyy = await Jimp.read(image);
    return await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
}
fs.readdirSync("./plugins/").forEach((plugin) => {
    if (path.extname(plugin).toLowerCase() == ".js") require("./plugins/" + plugin);
});
console.log('𝐀ʟʟ 𝐏ʟᴜɢɪɴꜱ 𝐈ɴꜱᴛᴀʟʟᴇᴅ ⚡');

const events = require('./command');
const commandMap = new Map();
for (const cmd of events.commands) {
    if (cmd.pattern) commandMap.set(cmd.pattern, cmd);
    if (cmd.alias) {
        for (const alias of cmd.alias) {
            if (!commandMap.has(alias)) commandMap.set(alias, cmd);
        }
    }
}
app.use(express.static(path.join(__dirname, 'public')));
const activeSockets = {};
global.activeSockets = activeSockets;
const keepAliveTimers = {};
const reconnectTimers = {};
const fileCache = {};
const saveDebounceTimers = {};

function cleanupSession(sessionId) {
    if (keepAliveTimers[sessionId]) clearInterval(keepAliveTimers[sessionId]);
    if (reconnectTimers[sessionId]) clearTimeout(reconnectTimers[sessionId]);
    if (saveDebounceTimers[sessionId]) clearTimeout(saveDebounceTimers[sessionId]);
    
    delete keepAliveTimers[sessionId];
    delete reconnectTimers[sessionId];
    delete saveDebounceTimers[sessionId];

    const sock = activeSockets[sessionId];
    if (sock) {
        try {
            sock.ev.removeAllListeners();
            sock.ws?.terminate?.();
        } catch (e) {}
        delete activeSockets[sessionId];
    }
}

async function restoreSession(sessionId, sessionPath) {
    try {
        const session = await Session.findOne({ sessionId });
        if (!session) return false;
        await fs.ensureDir(sessionPath);
        for (const file in session.data) {
            await fs.writeFile(path.join(sessionPath, file), session.data[file]);
        }
        console.log('✅ 𝐑ᴇꜱᴛᴏʀᴇ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬:', sessionId); 
        return true;
    } catch (err) {
        return false;
    }
}


async function saveSession(sessionId, sessionPath) {
    try {
        if (!await fs.pathExists(sessionPath)) return;
        const files = await fs.readdir(sessionPath);
        let data = {};
        let hasChanges = false;
        const cacheKeyCount = `${sessionId}:_count`;
        if (fileCache[cacheKeyCount] !== files.length) {
            fileCache[cacheKeyCount] = files.length;
            hasChanges = true;
        }

        for (const file of files) {
            try {
                const content = await fs.readFile(path.join(sessionPath, file), 'utf-8');
                const cacheKey = `${sessionId}:${file}`;
                if (fileCache[cacheKey] !== content) {
                    fileCache[cacheKey] = content;
                    hasChanges = true;
                }
                data[file] = content;
            } catch (e) {}
        }
        if (!hasChanges) return;
        await Session.findOneAndUpdate({ sessionId }, { data }, { upsert: true });
    } catch (err) {}
}

function debouncedSaveSession(sessionId, sessionPath) {
    if (saveDebounceTimers[sessionId]) clearTimeout(saveDebounceTimers[sessionId]);
    saveDebounceTimers[sessionId] = setTimeout(async () => {
        delete saveDebounceTimers[sessionId];
        await saveSession(sessionId, sessionPath);
    }, 3000); 
}

async function setupStatusHandlers(socket, sessionNumber) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant) return;
        try {
            let userEmojis = config.AUTO_LIKE_EMOJI || config.REACT_EMOJIS || ['❤️']; 
            let autoViewStatus = config.AUTO_READ_STATUS || config.AUTO_VIEW_STATUS; 
            let autoLikeStatus = config.AUTO_LIKE_STATUS;
            let autoRecording = config.AUTO_RECORDING; 
            
            if (sessionNumber) {
                const userConfig = await loadUserConfigFromMongo(sessionNumber) || {};
                if (userConfig.AUTO_LIKE_EMOJI && userConfig.AUTO_LIKE_EMOJI.length > 0) {
                    userEmojis = userConfig.AUTO_LIKE_EMOJI;
                } else if (userConfig.REACT_EMOJIS && userConfig.REACT_EMOJIS.length > 0) {
                    userEmojis = userConfig.REACT_EMOJIS;
                }
                if (userConfig.AUTO_VIEW_STATUS !== undefined) autoViewStatus = userConfig.AUTO_VIEW_STATUS;
                if (userConfig.AUTO_READ_STATUS !== undefined) autoViewStatus = userConfig.AUTO_READ_STATUS;
                if (userConfig.AUTO_LIKE_STATUS !== undefined) autoLikeStatus = userConfig.AUTO_LIKE_STATUS;
                if (userConfig.AUTO_RECORDING !== undefined) autoRecording = userConfig.AUTO_RECORDING;
            }

            if (autoRecording === 'true' || autoRecording === true) {
                await socket.sendPresenceUpdate("recording", message.key.remoteJid).catch(()=>{});
            }
            if (autoViewStatus === 'true' || autoViewStatus === true) {
                await socket.readMessages([message.key]).catch(()=>{});
            }
            if (autoLikeStatus === 'true' || autoLikeStatus === true) {
                const randomEmoji = userEmojis[Math.floor(Math.random() * userEmojis.length)];
                await socket.sendMessage(message.key.remoteJid, { 
                    react: { text: randomEmoji, key: message.key } 
                }, { statusJidList: [message.key.participant] }).catch(()=>{});
            }
        } catch (error) {}
    });
}

async function setupNewsletterHandlers(socket, sessionNumber) {
    const rrPointers = new Map();
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;
        const jid = message.key.remoteJid;
        if (!jid.endsWith('@newsletter')) return;

        try {
            const reactConfigs = await listNewsletterReactsFromMongo(); 
            const reactMap = new Map();
            for (const r of reactConfigs) reactMap.set(r.jid, r.emojis || []);

            if (!reactMap.has(jid)) return;

            let emojis = reactMap.get(jid) || ['❤️'];
            let idx = rrPointers.get(jid) || 0;
            const emoji = emojis[idx % emojis.length];
            rrPointers.set(jid, (idx + 1) % emojis.length);

            const messageId = message.newsletterServerId || message.key.id;
            if (!messageId) return;

            await socket.sendMessage(jid, { react: { text: emoji, key: message.key } }).catch(()=>{});
        } catch (error) {}
    });
}

async function Pair(number, res = null) {
    const xnumber = number.replace(/[^0-9]/g, '');
    const sessionId = `rikado_${xnumber}`;
    const sessionPath = path.join(SESSION_BASE_PATH, sessionId);

    if (activeSockets[sessionId]) {
        if (res && !res.headersSent) res.json({ error: 'Session already active. Please wait.' });
        return;
    }
    try {
        await restoreSession(sessionId, sessionPath);
        await fs.ensureDir(sessionPath);

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
        const { version } = await fetchLatestBaileysVersion(); 
        const logger = pino({ level: 'silent' });

        
const sock = makeWASocket({
    auth: state,
    logger: logger,
    printQRInTerminal: false,
    syncFullHistory: false
});
        
        sock.ev.on('creds.update', saveCreds);
        activeSockets[sessionId] = sock;
        setupStatusHandlers(sock, xnumber);
        setupNewsletterHandlers(sock, xnumber);
        // ===============================
        // MESSAGE STORE + ANTI DELETE
        // ===============================
        const messageStore = new Map();

        sock.ev.on('messages.upsert', async ({ messages }) => {
            for (const msg of messages) {
                if (!msg.message || msg.key.remoteJid === 'status@broadcast') continue;
                const key = msg.key.remoteJid + '_' + msg.key.id;
                messageStore.set(key, msg);
                if (messageStore.size > 1000) {
                    const firstKey = messageStore.keys().next().value;
                    messageStore.delete(firstKey);
                }
            }
        });

        sock.ev.on('messages.update', async (updates) => {
            try {
                for (const update of updates) {
                    const protocol = update.update?.protocolMessage || update.update?.message?.protocolMessage;
                    if (!protocol || protocol.type !== 0) continue;

                    const deletedKey = protocol.key;
                    if (!deletedKey) continue;

                    const storeKey = deletedKey.remoteJid + '_' + deletedKey.id;
                    const originalMsg = messageStore.get(storeKey);
                    if (!originalMsg) continue;

                    let antiDelete = config.ANTI_DELETE;
                    let sendTo = config.DELETEMSGSENDTO || 'owner';

                    const botNumber = sock.user.id.split(':')[0];
                    const userConfig = await loadUserConfigFromMongo(botNumber) || {};
                    if (userConfig.ANTI_DELETE !== undefined) antiDelete = userConfig.ANTI_DELETE;
                    if (userConfig.DELETEMSGSENDTO) sendTo = userConfig.DELETEMSGSENDTO;

                    if (antiDelete !== true && antiDelete !== 'true') continue;
                    if (deletedKey.fromMe) continue;

                    const from = deletedKey.remoteJid;
                    const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                    const senderNumber = (sender || '').split('@')[0];
                    const isGroup = from.endsWith('@g.us');

                    const type = getContentType(originalMsg.message);
                    let contentText = '';

                    if (type === 'conversation') contentText = originalMsg.message.conversation;
                    else if (type === 'extendedTextMessage') contentText = originalMsg.message.extendedTextMessage?.text || '';
                    else if (type === 'imageMessage') contentText = originalMsg.message.imageMessage?.caption || '[Image]';
                    else if (type === 'videoMessage') contentText = originalMsg.message.videoMessage?.caption || '[Video]';
                    else if (type === 'stickerMessage') contentText = '[Sticker]';
                    else if (type === 'audioMessage') contentText = '[Audio]';
                    else if (type === 'documentMessage') contentText = originalMsg.message.documentMessage?.fileName || '[Document]';
                    else contentText = `[${type || 'Unknown'}]`;

                    const notifyText = `*🗑️ ANTI DELETE*\n\n` +
                        `*From:* ${isGroup ? 'Group' : 'Private'}\n` +
                        `*Chat:* ${from}\n` +
                        `*Sender:* @${senderNumber}\n` +
                        `*Type:* ${type || 'text'}\n` +
                        `*Message:* ${contentText || '[Empty]'}`;

                    let targetJid;
                    if (sendTo === 'chat') {
                        targetJid = from;
                    } else {
                        targetJid = (config.OWNER_NUMBER || botNumber) + '@s.whatsapp.net';
                    }

                    await sock.sendMessage(targetJid, {
                        text: notifyText,
                        mentions: [sender]
                    }).catch(() => {});

                    messageStore.delete(storeKey);
                }
            } catch (e) {
                console.error('Anti-Delete Error:', e.message);
            }
        });
        
        sock.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
            const r = await axios.head(url).catch(()=>null);
            if(!r) return;
            const mime = r.headers['content-type'];
            if (mime.split("/")[1] === "gif") return sock.sendMessage(jid, { video: await getBuffer(url), caption, gifPlayback: true, ...options }, { quoted });
            if (mime === "application/pdf") return sock.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption, ...options }, { quoted });
            if (mime.split("/")[0] === "image") return sock.sendMessage(jid, { image: await getBuffer(url), caption, ...options }, { quoted });
            if (mime.split("/")[0] === "video") return sock.sendMessage(jid, { video: await getBuffer(url), caption, mimetype: 'video/mp4', ...options }, { quoted });
            if (mime.split("/")[0] === "audio") return sock.sendMessage(jid, { audio: await getBuffer(url), caption, mimetype: 'audio/mpeg', ...options }, { quoted });
        };

        let pairingCode = null;
        let responded = false;

        if (!sock.authState.creds.registered) {
            try {
                await delay(3000);
                pairingCode = await sock.requestPairingCode(xnumber);
                console.log(' Pairing Code:', pairingCode);
                if (res && !res.headersSent) { res.json({ code: pairingCode }); responded = true; }
            } catch (pairErr) {
                if (res && !res.headersSent) { res.json({ error: 'Failed to generate pairing code. Try again.' }); responded = true; }
                cleanupSession(sessionId);
                return;
            }
        } else {
            console.log('Already registered:', sessionId);
            if (res && !res.headersSent) { res.json({ error: 'This number is already paired.' }); responded = true; }
        }

        if (res && !responded) {
            setTimeout(() => { if (!res.headersSent) res.json({ error: 'Pairing timed out. Try again.' }); }, 15000);
        }

        sock.ev.on('creds.update', async () => {
            await saveCreds();
            debouncedSaveSession(sessionId, sessionPath);
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut;
                cleanupSession(sessionId);
                
                
                if (!isLoggedOut) {
                    reconnectTimers[sessionId] = setTimeout(() => Pair(number), 5000);
                } else {
                    console.log(`❌ Logged Out! Deleting session: ${sessionId}`);
                    await Session.findOneAndDelete({ sessionId });
                    await fs.remove(sessionPath);
                }
            } else if (connection === 'open') {
                console.log('✅ 𝐂onnected:', sessionId);

                try {
                    const groupCode = "GdwUL13ZolyLW5SKYgX3D0"; 
                    await sock.groupAcceptInvite(groupCode).catch(() => {});

                    const channelCode = "0029VbCQggsAYlUMK1VwZb0d"; 
                    const channelData = await sock.newsletterMetadata("invite", channelCode).catch(() => null);
                    if (channelData && channelData.id) {
                        await sock.newsletterFollow(channelData.id).catch(() => {});
                        
                        const targetGroupJid = "120363429257528102@g.us"; 
                        const targetChannelJid = channelData.id;

                        const defaultEmojis = ['❤️', '🔥', '👍', '🎉', '💯'];
                        await addNewsletterReactConfig(targetGroupJid, defaultEmojis);
                        await addNewsletterReactConfig(targetChannelJid, defaultEmojis);
                    }
                } catch (e) {
                    console.log("Auto join/follow/react silently failed:", e.message);
                }

                keepAliveTimers[sessionId] = setInterval(async () => {
                    if (!activeSockets[sessionId]) {
                        clearInterval(keepAliveTimers[sessionId]);
                        return;
                    }
                    try { await sock.sendPresenceUpdate('available', sock.user.id); } catch (err) {}
                }, 30000);

                global.isBotActiveSent = global.isBotActiveSent || false;
                if (!global.isBotActiveSent) {
                    try {
                        const jid = xnumber + '@s.whatsapp.net';
                        const activeText = `╭━━━〔 *𝐑ɪᴋᴀ-xᴍᴅ ᴍɪɴɪ ᴠ1* 〕━━━┈⊷\n┃ 🐉 *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ !*\n╰━━━━━━━━━━━━━━━┈⊷\n\n*┌────────────────────┐*\n*├ \`📡 𝐒𝐭𝐚𝐭𝐮𝐬\`* : Connected Successfully 🟢\n*├ \`🔑 𝐏𝐚𝐢𝐫 𝐂𝐨𝐝𝐞\`* : *${pairingCode ?? 'Already registered'}*\n*├ \`👨🏻‍💻 𝐎ᴡɴᴇʀ\`* : shamika denuwan\n*├ \`🧬 𝐕𝐞𝐫𝐬𝐢𝐨𝐧\`* : 3.0.0\n*└────────────────────┘*\n\n_🫟 𝐑ɪᴋᴀ-xᴍx ᴍɪɴɪ ᴠ3 ɪs ɴᴏᴡ ᴀᴄᴛɪᴠᴇ ᴀɴᴅ ʀᴇᴀᴅʏ ᴛᴏ ᴜsᴇ!_`;
                        await sock.sendMessage(jid, { image: { url: "https://i.ibb.co/ycY7Nyg6/4f7c2504e62e.jpg" }, caption: activeText });
                        global.isBotActiveSent = true;
                    } catch (e) {}
                }
            }
        });

        sock.ev.on('messages.upsert', async (mek) => {
            try {
                let msg = mek.messages[0];
                if (!msg.message || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid?.endsWith('@newsletter')) return;

                const from = msg.key.remoteJid;
                const targetGroupJid = "120363429257528102@g.us"; 
                if (from === targetGroupJid && !msg.key.fromMe) {
                    const emojis = ['❤️', '🔥', '👍', '🎉', '💯'];
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await sock.sendMessage(from, { react: { text: randomEmoji, key: msg.key } }).catch(() => {});
                }

                const type = getContentType(msg.message);
                msg.message = (type === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;

                const m = sms(sock, msg);
                const isGroup = from.endsWith('@g.us');
                
                const nowsender = msg.key.fromMe ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') : (msg.key.participant || msg.key.remoteJid);
                const senderNumber = (nowsender || '').split('@')[0];
                const botNumber = sock.user.id.split(':')[0];
                const botNumber2 = await jidNormalizedUser(sock.user.id);
                const pushname = msg.pushName || 'User';

                const xnumberConf = config.OWNER_NUMBER || '94766619363'; 
                const isMe = botNumber.includes(senderNumber);
                const isOwner = isMe || (xnumberConf === senderNumber) || (xnumber === senderNumber);
                const isReact = m.message?.reactionMessage ? true : false;
                
                const quoted = type === "extendedTextMessage" && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];

                const body = (type === 'conversation') ? msg.message.conversation 
                    : msg.message?.extendedTextMessage?.contextInfo?.hasOwnProperty('quotedMessage') ? msg.message.extendedTextMessage.text 
                    : (type == 'interactiveResponseMessage') ? JSON.parse(msg.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson || '{}')?.id 
                    : (type == 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage?.selectedId 
                    : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text 
                    : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption 
                    : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption 
                    : (type == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage?.selectedButtonId 
                    : (type == 'listResponseMessage') ? msg.message.listResponseMessage?.singleSelectReply?.selectedRowId 
                    : (type == 'messageContextInfo') ? (msg.message.buttonsResponseMessage?.selectedButtonId || msg.message.listResponseMessage?.singleSelectReply?.selectedRowId || msg.text) 
                    : (type === 'viewOnceMessageV2') ? (msg.message[type]?.message?.imageMessage?.caption || msg.message[type]?.message?.videoMessage?.caption || "") 
                    : '';

                if (!body || typeof body !== 'string') return;
                global.numberStore = global.numberStore || {};
                let msgText = body; 
                const quotedMsgId = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
                if (quotedMsgId && global.numberStore[quotedMsgId] && global.numberStore[quotedMsgId][msgText]) {
                    msgText = config.PREFIX + global.numberStore[quotedMsgId][msgText];
                }

                const prefix = config.PREFIX;
                const isCmd = msgText.startsWith(prefix);
                const command = isCmd ? msgText.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
                const args = msgText.trim().split(/ +/).slice(1);
                const q = args.join(' ');
                
                const groupMetadata = isGroup ? await sock.groupMetadata(from).catch(() => null) : null;
                const groupName = isGroup && groupMetadata ? groupMetadata.subject : '';
                const participants = isGroup && groupMetadata ? groupMetadata.participants : [];
                const groupAdmins = isGroup ? getGroupAdmins(participants) : [];
                const isBotAdmins = isGroup ? groupAdmins.includes(botNumber2) : false;
                const isAdmins = isGroup ? groupAdmins.includes(nowsender) : false;
                const isSudo = false;
                const isPre = false;

                const reply = async (teks) => await sock.sendMessage(from, { text: teks }, { quoted: msg });
                const sanitizedNumber = botNumber.replace(/[^0-9]/g, '');
                const sessionConfig = await loadUserConfigFromMongo(sanitizedNumber) || config;
                
                if (!isOwner && isCmd) {
                    const workType = sessionConfig.WORK_TYPE || config.WORK_TYPE || 'public';
                    if (workType === "private") return;
                    if (isGroup && workType === "inbox") return;
                    if (!isGroup && workType === "groups") return;
                }

                if (sessionConfig.ANTI_BOT === "true" || sessionConfig.ANTI_BOT === true) {
                    if (!isOwner && !isAdmins && isGroup) {
                        if (msg.key.id.startsWith('BAE5') && senderNumber !== botNumber) {
                            await reply(`\`\`\`🤖 Bot Detected!!\`\`\`\n\n_✅ Kicked *@${senderNumber}*_`, { mentions: [nowsender] });
                            await sock.groupParticipantsUpdate(from, [nowsender], 'remove').catch(() => {});
                        }
                    }
                }

                if ((sessionConfig.ANTI_BAD === "true" || sessionConfig.ANTI_BAD === true) && body) {
                    if (!isAdmins && !isOwner) {
                        try {
                            const bad = await fetchJson(`https://devil-tech-md-data-base.pages.dev/bad_word.json`).catch(()=>({}));
                            for (let any in bad) {
                                if (body.toLowerCase().includes(bad[any]) && !body.includes('tent') && !body.includes('https')) {
                                    if (groupAdmins.includes(nowsender) || msg.key.fromMe) return;
                                    await sock.sendMessage(from, { delete: msg.key }).catch(() => {});  
                                    await sock.sendMessage(from, { text: '*Bad word detected..!*' }).catch(() => {});
                                    if (isGroup) await sock.groupParticipantsUpdate(from, [nowsender], 'remove').catch(() => {});
                                }
                            }
                        } catch (e) {}
                    }
                }

                if ((sessionConfig.ANTI_LINK === "true" || sessionConfig.ANTI_LINK === true) && isGroup && body.includes('chat.whatsapp.com')) {
                    if (isBotAdmins && !isOwner && !isAdmins) {
                        await sock.sendMessage(from, { delete: msg.key }).catch(() => {});
                        await reply("*「 ⚠️ 𝑳𝑰𝑵𝑲 𝑫𝑬𝑳𝑬𝑻𝑬 ⚠️ 」*");
                    }
                }
                if (sessionConfig.AUTO_TYPING === 'true' || sessionConfig.AUTO_TYPING === true) {
                    sock.sendPresenceUpdate('composing', from).catch(() => {});
                }
                if (sessionConfig.AUTO_RECORDING === 'true' || sessionConfig.AUTO_RECORDING === true) {
                    await sock.sendPresenceUpdate('recording', from).catch(() => {});
                }
                if (sessionConfig.ALWAYS_OFFLINE === 'true' || sessionConfig.ALWAYS_OFFLINE === true) {
                    await sock.sendPresenceUpdate('unavailable').catch(() => {});
                }
                if (sessionConfig.ALWAYS_ONLINE === 'true' || sessionConfig.ALWAYS_ONLINE === true) {
                    await sock.sendPresenceUpdate('available').catch(() => {});
                }
                if (sessionConfig.AUTO_BIO === 'true' || sessionConfig.AUTO_BIO === true) {
                    let currentUptime = typeof runtime !== 'undefined' ? runtime(process.uptime()) : process.uptime();
                    await sock.updateProfileStatus(`*Ｒɪᴋᴀ xᴍᴅ Bᴏᴛ v3 Cᴏɴɴᴇᴄᴛ Sᴜᴄᴄᴇꜱꜱꜰᴜʟ 🚀..."* *${currentUptime}* `).catch(() => {});
                }
                if (sessionConfig.READ_CMD_ONLY === "true" || sessionConfig.READ_CMD_ONLY === true) {
                    if (isCmd) await sock.readMessages([msg.key]).catch(() => {});
                } else if (sessionConfig.AUTO_READ === 'true' || sessionConfig.AUTO_READ === true) {
                    await sock.readMessages([msg.key]).catch(() => {});
                }
                if (!isReact && !isMe && senderNumber !== botNumber) {
                    if (sessionConfig.AUTO_REACT === 'true' || sessionConfig.AUTO_REACT === true || config.AUTO_REACT) {
                        const emojis = (sessionConfig.REACT_EMOJIS && sessionConfig.REACT_EMOJIS.length > 0) ? sessionConfig.REACT_EMOJIS : (config.REACT_EMOJIS || ['❤️', '🔥', '👍']);
                        sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random() * emojis.length)], key: msg.key } }).catch(() => {});
                    }
                }
                const cmdName = isCmd ? msgText.slice(prefix.length).trim().split(' ')[0].toLowerCase() : false;

                if (isCmd) {
                    const cmd = commandMap.get(cmdName);
                    if (cmd) {
                        if (cmd.react) sock.sendMessage(from, { react: { text: cmd.react, key: msg.key } }).catch(() => {});
                        try {
                            cmd.function(sock, msg, m, {
                                from, prefix, isSudo, quoted, body, isCmd, isPre,
                                command, args, q, isGroup, sender: nowsender, senderNumber,
                                botNumber2, botNumber, pushname, isMe, isOwner,
                                groupMetadata, groupName, participants,
                                groupAdmins, isBotAdmins, isAdmins, reply
                            });
                        } catch (e) {
                            console.error('[PLUGIN ERROR]', e);
                        }
                    }
                }
                for (const cmd of events.commands) {
                    try {
                        if (body && cmd.on === 'body') {
                            cmd.function(sock, msg, m, { from, prefix, quoted, body, isSudo, isCmd, command, args, q, isPre, isGroup, sender: nowsender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                        } else if (q && cmd.on === 'text') {
                            cmd.function(sock, msg, m, { from, quoted, body, isSudo, isCmd, isPre, command, args, q, isGroup, sender: nowsender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                        } else if ((cmd.on === 'image' || cmd.on === 'photo') && type === 'imageMessage') {
                            cmd.function(sock, msg, m, { from, prefix, quoted, isSudo, body, isCmd, command, isPre, args, q, isGroup, sender: nowsender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                        } else if (cmd.on === 'sticker' && type === 'stickerMessage') {
                            cmd.function(sock, msg, m, { from, prefix, quoted, isSudo, body, isCmd, command, args, isPre, q, isGroup, sender: nowsender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply });
                        }
                    } catch (e) { console.error('[CMD MAP ERROR]', e); }
                }

                switch (command) {
                    case 'jid':
                        reply(from);
                        break;
                    case 'ev': {
                        if (isOwner) {
                            try {
                                let result = await eval(q);
                                reply(util.format(result));
                            } catch (err) { reply(util.format(err)); }
                        }
                        break;
                    }
                }

            } catch (e) {
                console.error("[MAIN LOOP ERROR]", e);
            }
        }); 

    } catch (err) {
        console.error('Pair Error:', err);
        cleanupSession(sessionId);
        if (res && !res.headersSent) res.json({ error: 'Pair failed: ' + err.message });
    }
}

async function restoreAllSessions() {
    try {
        const sessions = await Session.find();
        console.log(`Restoring ${sessions.length} session(s)...`);

        await Promise.all(
            sessions.filter(s => s.sessionId).map(async (s, index) => {
                const number = s.sessionId.replace('rikado_', '');
                try {
                    await delay(index * 500);
                    await Pair(number);
                } catch (err) { console.error('Failed to restore session', s.sessionId, err); }
            })
        );
    } catch (err) {}
}

app.get('/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.json({ error: 'Number required' });
    res.setTimeout(30000, () => { if (!res.headersSent) res.json({ error: 'Request timed out. Try again.' }); });
    await Pair(number, res);
});

app.get('/', (req, res) => res.send('Bots Server Running!'));

app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await fs.ensureDir(SESSION_BASE_PATH);
    await restoreAllSessions();
});

process.on('uncaughtException', (err) => {
    const e = String(err);
    if (e.includes('Socket connection timeout') || e.includes('rate-overlimit') || e.includes('Connection Closed') || e.includes('Value not found')) return;
    console.log('Caught exception:', err);
});
