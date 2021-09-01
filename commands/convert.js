const { doConversions } = require("../lib/measurements"),
    Embed = require("../utils/embed")

/**
 * 
 * @param {string} data 
 * @returns 
 */
 const parseMessage = (data, user) => {
    const embed = new Embed()
    const concatenated = data.replace("°","").replace(/(?<=\d) /gm,"").toLowerCase() + " "
    const result = doConversions(concatenated, user)
    for(let i = 0; i < result.length; i++) {
        if(i >= 25) break;
        embed.addField(`conversion #${i+1}`,`${result[i].from} **➟** ${result[i].to}`)
    }
    embed.description = data
    return embed
}

/**
 * 
 * @param {array} args 
 * @param {*} msg 
 */
const run = async ( args, msg ) => {
    args.shift()
    if(!args[1]) {
        const messages = await msg.channel.fetchMessages({ limit: 2 })
        msg = messages[1]
        args = msg.content.split(" ")
    }
    const embed = parseMessage(args.join(" "), msg.author_id)
    embed.title = `${msg.author.username}`
    embed.setFooter("missing a conversion? edit and make PR on github.com/ffamilyfriendly/converter/blob/main/lib/measurements.js")
    msg.reply(embed.toText())
}

module.exports = run