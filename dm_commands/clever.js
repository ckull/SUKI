
const Cleverbot = require('cleverbot-node')
const setting = require('../setting.json')

var cleverbot = new Cleverbot;

exports.run = (client, message, args) => {
    cleverbot.configure({botapi: setting.cleverApi});
    cleverbot.write(message.content, response => {
       message.channel.send(response.output)
    });
}