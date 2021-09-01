# Converter
adds "Auto Convert" to message context menu. Running that command will give you and embed with any units the bot could parse in the selected message and their conversion to the biggest alternative unit ( si units -> yankee units and the other way around )

## missing a unit?
fork this repo, edit https://github.com/ffamilyfriendly/converter/blob/main/lib/measurements.js, and make a PR and I'll test & merge it asap.
if you are lazy you can also create an issue on this repo and I might add it for you

## my instance
https://app.revolt.chat/bot/01FE9WH8VQYYX9YTK1MXAWDQ3H

## host your own
to host your own instance you need to:
* clone this repo
* rename example.env to .env
* configure your discord application (add interaction url to whatever port you configured in .env)
* run the bot!