const MALjs = require('MALjs');
const mal = new MALjs('discordbot187811', '187811discordBot');
const moment = require('moment')
exports.run = (client, message, args) => { // eslint-disable-line no-unused-vars

    if (args.length === 0) {
        mal.verifyCredentials().then((data) => {
            console.log(data)
        }).catch(err => {
            console.log(err)
        })
        return
    }

    let input = args.splice(1).join(" ")
    console.log(input)
    if (args[0] === 'find') {
        if(input === '') {return}
        mal.anime.search(input).then((data) => {
            data.anime.forEach(result => {
                const embed = {
                    "title": "Synonyms: " + result.synonyms.toString().split(/\s*;\s*/).join(", "),
                    "description": result.synopsis.toString().replace(/<\/?[^>]+(>|$)/g, ""),
                    "color": 15105570,
                    "timestamp": moment().format(),
                    "thumbnail": {
                        "url": result.image.toString()
                    },
                    "author": {
                        "name": result.title.toString()
                      },
                    "fields": [
                        {
                          "name": "Score",
                          "value": result.score.toString(),
                          "inline": true
                        },
                        {
                            "name": "Type",
                            "value": result.type.toString(),
                            "inline": true
                        },
                        {
                            "name": "Status",
                            "value": result.status.toString(),
                            "inline": true
                        },
                        {
                            "name": "Episodes",
                            "value": result.episodes.toString(),
                            "inline": true
                        },
                        {
                            "name": "Start date",
                            "value": result.start_date.toString(),
                            "inline": true
                        },
                        {
                            "name": "End date",
                            "value": result.end_date.toString(),
                            "inline": true
                        }
                    ]
                }
                message.channel.send({
                    embed
                })
            })
        }).catch(err => {
            console.log(err)
            message.channel.send(input + ': Not found')
        })
    }
}

exports.help = {
    name: "!anime find <name>",
    value: "Show information of anime that related to its name"
  };