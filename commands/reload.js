const { doConversions } = require("../lib/measurements"),
    getCmds = require("../index").getCmds

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
    if(msg.author_id != "01EXC6K282P9SD3T6TD5EC1ETE") return
    getCmds()
    msg.reply("```\ndone. \n```")
}

module.exports = run