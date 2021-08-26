const APIPATH = "https://discord.com/api/v8",
    req = require("node-fetch"),
    handlerList = []

const typeEnum = {
    CHAT_INPUT: 1,
    USER: 2,
    MESSAGE: 3
}

class Embed {
    constructor() {
        this.embed = {
            title: "",
            description: "",
            url: "",
            timestamp: "",
            color: 0x00ffff,
        }
    }

    set title(title) {
        this.embed.title = title
    }

    set description(description) {
        this.embed.description = description
    }

    set url(url) {
        this.embed.url = url
    }

    set timestamp(stamp) {
        this.embed.timestamp = stamp
    }

    set color(colour) {
        this.embed.color = colour
    }

    /**
     * 
     * @param {string} name title of field
     * @param {string} value value of field
     * @param {string} inline wheter or not field should be inline
     */
    addField(name, value, inline = false) {
        if(!this.embed.fields) this.embed.fields = []
        this.embed.fields.push({ name, value, inline })
    }

    /**
     * 
     * @param {string} name name of author
     * @param {string} url url of author
     * @param {string} icon icon of author (image, http/https only)
     */
    setAuthor(name, url, icon) {
        this.embed.author = { name, url, icon_url: icon }
    }

    setProvider(name, url) {
        this.embed.provider = { name, url }
    }

    /**
     * 
     * @param {string} text footer text
     * @param {string} url icon of footer (image, http/https only)
     */
    setFooter(text, url) {
        this.embed.footer = { text, icon_url: url }
    }
}

class InteractionResponse {
    #token;
    constructor(data, res) {
        this.channel = data.channel_id
        this.guild = data.guild_id
        this.interactionID = data.id
        if(data.data.type === 3) {
            this.message = data.data.resolved.messages[Object.keys(data.data.resolved.messages)[0]]
        }
        this.name = data.data.name
        this.target = data.data.target_id
        this.user = {
            username: `${data.member.user.username}#${data.member.user.discriminator}`,
            id: data.member.user.id,
            flags: data.member.user.public_flags,
            member: {
                joined: Date(data.member.joined_at),
                nick: data.member.nick,
                permissions: data.member.permissions
            }
        }
        this.content = null
        this.embeds = []
        this.flags = null
        this.#token = data.token
        this.res = res
    }

    addEmbed(embed) {
        this.embeds.push(embed.embed)
    }

    set private(privacy) {
        this.flags = privacy ? 1 << 6 : 0
    }

    respond() {
        const resObj = { type:4, data: { embeds: this.embeds, content: this.content, flags: this.flags } }
        this.res.send(resObj)
    }
}

/**
 * @typedef {} Option
 */

/*
class Option {
    constructor() {

    }
}
*/

/**
 * @typedef {"MESSAGE" | "USER" | "CHAT_INPUT"} InteractionTypeEnum
 */

/**
 * @callback onUsed
 * @param {InteractionResponse} res - Interaction response
 */

class Interaction {
    /**
     * 
     * @param {InteractionTypeEnum} type the Interaction type
     * @param {string} name the name of the Interaction
     * @param {string} description the description of the Interaction
     */
    constructor(type = "MESSAGE", name = "interaction", description) {
        // make sure type is uppercase incase some bugger puts it in lower case
        type = type.toUpperCase()
        // make sure all parameters are in order and all types are correct
        if(!["MESSAGE","USER","CHAT_INPUT"].includes(type) || typeof type != "string") throw new Error("param type has to be of type string and be either MESSAGE, USER, or CHAT_INPUT.")
        if(typeof name != "string") throw new Error("param name has to be of type string")
        if(description && type != "CHAT_INPUT") console.warn(`Interaction of type "${type}" does not take parameter description`)
        this.options = {
            type: typeEnum[type], name
        }
        if(description && type == "CHAT_INPUT") {this.options["description"] = description; this.options["options"] = []}
    }

    /**
     * 
     * @param {string} applicationID internal function ran by InteractionManager when registering command 
     */
    _initiate(applicationID, handler) {
        this.id = applicationID
        this.handler = handler
    }

    /**
     * @name addOption 
     * @description !!not implemented!!
     */
    addOption() {
        throw new Error("Not implemented")
    }

    /**
     * 
     * @param {string} id id of the server to add interaction to. If left empty code will assume it's a global command
     */
    addToDiscord(id) {
        if(!this.handler) throw new Error("you need to pass the interaction to a instance of InteractionHandler before trying to add the Interaction")
        return this.handler.register(this, id)
    }

    /**
     * Handle Interaction usage!
     * @param {onUsed} cb 
     */
    onUsed(cb) {
        this.cb = cb
    }

    _onUsed(res) {
        this.cb(res)
    }
}

/**
 * onUsed event
 * @event Interaction#onUsed
 * @type {onUsed}
 */

class InteractionHandler {
    // initiate private property token
    #token;
    /**
     * 
     * @param {string} token 
     * @param {string} applicationID 
     */
    constructor(token, applicationID) {
        if(typeof token != "string" || !token) throw new Error("you need to pass a token")
        if(typeof applicationID != "string" || !applicationID) throw new Error("you need to pass the application ID")
        this.id = applicationID
        this.#token = token;
        this.interactions = []
        handlerList.push(this)
    }

    /**
     * 
     * @param {Interaction} interaction 
     */
    handle(interaction) {
        const isInteraction = typeof interaction == "object" && interaction?.constructor.name == "Interaction"
        if(!isInteraction) throw new Error("You need to pass an instance of Interaction.")
        interaction._initiate(this.id, this)
        this.interactions.push(interaction)
    }

    register(command, id) {
        const apipath = `${APIPATH}/applications/${this.id}/${id ? `guilds/${id}/` : ""}commands`
        return new Promise((resolve, reject) => {
            req(apipath, {
                method: "POST",
                body: JSON.stringify(command.options),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${this.#token}`
                },
            })
            .then(res => res.json())
            .then(json => {
                if(json?.id) resolve(json)
                else reject(json?.message)
            })
        })
    }

    /**
     * @name INTERNAL handleInteraction
     * @description handles interactions. Internal command
     * @param {InteractionResponse} res
     */
    handleInteraction(res) {
        const matching = this.interactions.find(int => int.options.name == res.name)
        if(matching && matching.onUsed) matching._onUsed(res)
        else {
            res.content = "no such interaction is handled. Contact bot administrator"
            res.flags = 1 << 6
            res.respond()
        }
    }
}

const express = require("express"),
    nacl = require("tweetnacl"),
    bp = require("body-parser"),
    config = require("dotenv").config().parsed

const server = express()

var rawBodySaver = function (req, res, buf, encoding) {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
server.use(bp.json({ verify: rawBodySaver, extended: true }));

server.post("/interaction", (req,res) => {
    const pubkey = config.PUBLIC_TOKEN
    const signature = req.get("X-Signature-Ed25519")
    const timestamp = req.get("X-Signature-Timestamp")
    const body = req.rawBody
    if(!signature || !timestamp || !body) return res.sendStatus(401)
    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(pubkey, 'hex')
    )
    if(!isVerified) return res.sendStatus(401)

    switch(req.body.type) {
        case 1:
            return res.status(200).json({type: 1})
        case 2:
            handlerList.forEach(handler => {
                const intRes = new InteractionResponse(req.body, res)
                handler.handleInteraction(intRes)
            })
        break;
        default:
            console.log("unhandled type", req.body)
            return res.status(404).send("I am confused")
        break;
    }
    
    //HANDLE INTERACTION
})

server.listen(config.PORT)

module.exports = { InteractionHandler, Interaction, InteractionResponse, Embed }