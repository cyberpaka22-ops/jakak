const config = require('../config')
const { cmd } = require('../command')
const axios = require('axios')

cmd({
    pattern: "git",
    alias: ["gitclone", "repo", "gitdl"],
    desc: "Search or Download Github repo.",
    category: "search",
    react: "🐙"
},
async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply('❌ *Usage:*\n.git search baileys\n.gitdl owner/repo')

        // .gitdl owner/repo format
        if (q.toLowerCase().startsWith('dl ') || cmd.pattern === "gitdl") {
            let repo = q.replace(/^dl\s+/i, '').trim()
            if (!repo.includes('/')) return reply('❌ *Format: .gitdl owner/repo*\nEx: .gitdl WhiskeySockets/Baileys')
            
            let zipUrl = `https://github.com/${repo}/archive/refs/heads/main.zip`
            let name = repo.split('/')[1]
            
            await reply(`📦 *Downloading ${name}-main.zip...*\n⏳ File eka loku nam tikak welawa gani.`)
            
            await conn.sendMessage(from, { 
                document: { url: zipUrl }, 
                fileName: `${name}-main.zip`,
                mimetype: 'application/zip',
                caption: `🐙 *${repo}*\n🔗 https://github.com/${repo}`
            }, { quoted: mek })
            return
        }

        // .git search
        let url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&per_page=5`
        let { data } = await axios.get(url, { 
            headers: { 'User-Agent': 'Rika-Mini-Bot' },
            timeout: 10000 
        })
        
        if (data.total_count === 0) return reply('❌ *Repo na yako*')

        let text = `🐙 *GITHUB SEARCH: ${q}*\n*Found: ${data.total_count}*\n\n`
        
        data.items.forEach((repo, i) => {
            text += `*${i+1}. ${repo.full_name}*\n`
            text += `📝 ${repo.description || 'No description'}\n`
            text += `⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}\n`
            text += `⬇️ Download: .gitdl ${repo.full_name}\n`
            text += `🔗 ${repo.html_url}\n\n`
        })
        
        text += `> ＰᴏᴡᴇʀᴇᴅＢʏ ＳʜᴀᴍɪᴋᴀＤᴇɴᴜᴡᴀɴ 🐉`
        await reply(text)

    } catch (e) {
        console.log(e)
        if (e.response && e.response.status === 404) {
            reply(`❌ *Repo hambaune na. Name hari da?*`)
        } else {
            reply(`❌ Error: ${e.message}`)
        }
    }
})
