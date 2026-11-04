const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const fs = require('fs')

module.exports = {
  name: 'setstatus',
  alias: ['setstatus', 'setst'],
  category: 'owner', // හෝ ඔයාට ඕන category එක
  desc: 'Reply to image/video/audio and set as WhatsApp Status',
  async execute(sock, m, { args, isOwner }) {
    if (!isOwner) return m.reply('Owner only!')

    if (!m.quoted) {
      return m.reply('Reply කරලා image / video / audio (mp3/ptt) එකකට `.setstatus` ගහන්න')
    }

    const quoted = m.quoted
    const mime = (quoted.msg || quoted).mimetype || ''
    const caption = args.join(' ') || ''   // caption එකක් දුන්නොත් ඒක

    // statusJidList එක හදාගන්න (ඔයාගේ bot එකේ contacts list එක භාවිතා කරන්න)
    // මේක උදාහරණයක් - ඔයාගේ store එකෙන් හෝ privacy settings එකෙන් ගන්න
    let statusJidList = []
    try {
      // බොහෝ bots වල store.contacts හෝ එවැනි එකක් තියෙනවා
      const contacts = Object.keys(sock.store?.contacts || {})
      statusJidList = contacts.filter(j => j.endsWith('@s.whatsapp.net')).slice(0, 50) // limit එකක් දාන්න
    } catch (e) {
      statusJidList = [] // හිස් නම් පෙනෙන්නේ නෑ
    }

    if (statusJidList.length === 0) {
      return m.reply('statusJidList හොයාගන්න බැරි වුණා. Contacts load වෙලා තියෙනවද බලන්න.')
    }

    try {
      const buffer = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage })

      if (mime.includes('image')) {
        await sock.sendMessage('status@broadcast', {
          image: buffer,
          caption: caption
        }, {
          statusJidList,
          broadcast: true
        })
        return m.reply('✅ Image Status set කළා!')
      }

      if (mime.includes('video')) {
        await sock.sendMessage('status@broadcast', {
          video: buffer,
          caption: caption
        }, {
          statusJidList,
          broadcast: true
        })
        return m.reply('✅ Video Status set කළා!')
      }

      if (mime.includes('audio') || mime.includes('ogg') || mime.includes('mp4') || quoted.ptt) {
        // Voice / Audio Status
        await sock.sendMessage('status@broadcast', {
          audio: buffer,
          mimetype: mime.includes('ogg') ? 'audio/ogg; codecs=opus' : 'audio/mp4',
          ptt: true
        }, {
          statusJidList,
          backgroundColor: '#000000',   // mobile එකේ පෙනෙන්න මේක අනිවාර්යයි
          broadcast: true
        })
        return m.reply('✅ Voice Status set කළා!')
      }

      return m.reply('Image, Video හෝ Audio (mp3/ptt) එකකට reply කරන්න')
    } catch (err) {
      console.error(err)
      m.reply('Error ආවා: ' + err.message)
    }
  }
}
