const config = require("dotenv").config().parsed,
    fetch = require("node-fetch"),
    fs = require("fs"),
    { getUserSettings } = require("./settings")
let rates = null

const startLoop = () => {
    const data = fs.existsSync("./data.json") ? JSON.parse(fs.readFileSync("./data.json")) : null
    if(!data) return console.error("no data.json")
    rates = data
}

const shorthand = (unit) => {
    const definitions = {
        "$": "usd",
        "£": "gbp",
        "€": "eur"
    }
    return definitions[unit] || unit
}

const convert = (t, rMatch, user) =>  {
    const [ beforeNumber, afterNumber ] = [ rMatch[3], rMatch[4] ]
    const toCurr = getUserSettings(user.id, "currency")
    const fromCurr = shorthand(beforeNumber || afterNumber)
    if(toCurr == fromCurr || !rates.rates[fromCurr.toUpperCase()]) return false
    const curr = Number(t.match(/\d+/gm)[0])
    const inEur = curr / rates.rates[fromCurr.toUpperCase()]
    const inSelCurr = (inEur * rates.rates[toCurr.toUpperCase()]).toFixed(2)

    return `${inSelCurr} ${toCurr}`

}

module.exports = { startLoop, convert }