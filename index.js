const config = require("dotenv").config().parsed,
    revolt = require("revolt.js"),
    { startLoop } = require("./utils/currency"),
    fs = require("fs")

const client = new revolt.Client()

client.on("ready", () => {
    console.info(`logged in as ${client.user?.username}`)
})

const getCmds = () => {
    return new Map(fs.readdirSync("./commands").map(f => { return [ f.split(".")[0], require(`./commands/${f}`) ] }))
}

module.exports = { getCmds }

const commands = getCmds()

client.on("message", (msg) => {
    if(!msg.content.startsWith("/")) return
    const args = msg.content.substr(1).split(" ")
    if(commands.has(args[0])) commands.get(args[0])(args, msg)
})

client.loginBot(config.TOKEN)
startLoop()

