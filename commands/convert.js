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
const run = ( args, msg ) => {
    args.shift()
    const embed = parseMessage(args.join(" "), msg.author_id)
    embed.title = `${msg.author.username}`
    embed.setFooter("missing a conversion? edit and make PR on github.com/ffamilyfriendly/converter/blob/main/lib/measurements.js")
    msg.reply(embed.toText())
}

module.exports = run