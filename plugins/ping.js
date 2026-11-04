const config = require('../config')
const { cmd, commands } = require('../command')

cmd({
  pattern: "ping",
  react: '🚶🏻',
  alias: ["RIKAXMD", "ping"],
  desc: "To Check bot's ping",
  category: "main",
  filename: __filename
},
async (bot, message, m, { from,l,quoted,body,isCmd,command,argsArray,query,isGroup,sender,senderNumber,botNumber2,botNumber,pushname,isMe,isOwner,groupMetadata,groupName,participants,groupAdmins,isBotAdmins,isAdmins,
  reply
}) => {
  try {
    var startTime = new Date().getTime();    
    const initialMessage = { text: "*_Pinging to RIKA Module..._* ❗" };
    let sentMessage = await bot.sendMessage(from, initialMessage);
    var endTime = new Date().getTime();
    const loadingStages = [

      "◍○○○○",
      "◍◍○○○",
      "◍◍◍○○",
      "◍◍◍◍○",
      "◍◍◍◍◍"
    ];

    for (let stage of loadingStages) {

      await bot.sendMessage(from, { text: stage, edit: sentMessage.key });
    }
    return await bot.sendMessage(from, {

      text: "📍️ *𝐑ɪᴋᴀ 𝐗ᴍᴅ 𝐒ᴘᴇᴇꜱ " + (endTime - startTime) + " Ms* ",
      edit: sentMessage.key
    });
  } catch (error) {
    reply("*Error !!*");
    l(error);
  }
});

cmd({
    pattern: "gay",
    desc: "Check gay percentage.",
    category: "fun",
    react: "🏳️‍🌈",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        
        let targetNumber = senderNumber;
        let targetJid = sender;

        if (m.quoted) {
            targetNumber = m.quoted.sender.split('@')[0];
            targetJid = m.quoted.sender;
        } else if (m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
            targetJid = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            targetNumber = targetJid.split('@')[0];
        }

        let responseText = '';

        
        if (targetNumber === "9476111111") {
            responseText = `*🏳️‍🌈 ɢᴀʏ ᴄʜᴇᴄᴋᴇʀ 🏳️‍🌈*\n\n👤 ᴜsᴇʀ : @${targetNumber}\n📊 ɢᴀʏ ᴘᴇʀᴄᴇɴᴛᴀɢᴇ : *0%*\n\n😎 මේයා නම් සිරාම කොල්ලෙක්! කිසිම අවුලක් නෑ. (100% Straight)`;
        } else {
            
            const percentage = Math.floor(Math.random() * 101);
            let comment = '';
            
            if (percentage === 0) comment = "😎 නියම කොල්ලෙක්! (100% Straight)";
            else if (percentage < 30) comment = "හොඳයි හොඳයි, ලොකු අවුලක් නෑ! 😌";
            else if (percentage < 60) comment = "පොඩි සැකයක් තියෙනවා... හැරෙන පොට නම් හරි නෑ වගේ 🤔";
            else if (percentage < 90) comment = "අම්මෝ... මූගෙන් පරිස්සමින් ඉන්න ඕන! 😬";
            else comment = "අප්පටසිරි! සිරාම ඩයල් එකක්නේ. ළඟින්වත් තියාගන්න එපා... 🏃‍♂️💨";

            responseText = `*🏳️‍🌈 ɢᴀʏ ᴄʜᴇᴄᴋᴇʀ 🏳️‍🌈*\n\n👤 ᴜsᴇʀ : @${targetNumber}\n📊 ɢᴀʏ ᴘᴇʀᴄᴇɴᴛᴀɢᴇ : *${percentage}%*\n\n${comment}`;
        }

        
        await conn.sendMessage(from, { 
            text: responseText, 
            mentions: [targetJid] 
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
})
