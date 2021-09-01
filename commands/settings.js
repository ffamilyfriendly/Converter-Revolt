const { def, isValidSetting, getUserSettings, setUserSettings } = require("../utils/settings")
const Embed = require("../utils/embed")

const run = ( args, msg ) => {
    const embed = new Embed()

    const key = args[2]
    if(!args[1] || !["set", "get"].includes(args[1])) return msg.reply("first param must be get or set")
    if(!key || args[2] != "currency") return msg.reply(`${args[2]} is not an allowed setting. Allowed: "${Object.keys(def).join(", ")}"`)
    if(args[1] == "set") {
        let value = args[3]
        if(!value) return msg.reply("a value must be passed on the set command")
        if(typeof value == "string") value = value.toLowerCase()

        const valid = isValidSetting(key,value)
        embed.title = "Settings"
        if(valid) {
            setUserSettings(msg.author_id, key, value)
            embed.addField("👌 sure thing, boss!", `**${key}** is now **${value}**`)
        } else {
            embed.addField("❌ No can do", `**${value}** is not an allowed value. Use \`/setting get setting:${key}\` to view allowed values`)
        }
    } else {
        embed.addField("Currently",`**${getUserSettings(msg.author_id, key)}**`)
        embed.addField(`Allowed values`, def[key].allowed.join(", "))
    }
    
    msg.reply(embed.toText())
}

module.exports = run