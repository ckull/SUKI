var owjs = require('overwatch-js');
const moment = require('moment')

exports.run = (client, message, args) => {

    if (args[0] === 'find') {
        if (args[1] === null || args[1] === '') {
            return
        }
    
        owjs.getOverall('pc', 'us',args[1]).then( (data) => {
            const embed = {
                "title": "Level: " + data.profile.level,
                "color": 1752220,
                "author": {
                    "name": data.profile.nick,
                    "url": data.profile.url,
                    "icon_url": data.profile.rankPicture
                },
                "timestamp": moment().format(),
                "footer": {
                  "icon_url": "https://d1u5p3l4wpay3k.cloudfront.net/overwatch_gamepedia/2/2a/PI_Overwatch_Logo_White.png?version=973c752f819268b986758acb7240cbfc",
                  "text": "overwatch overall stats"
                },
                "thumbnail": {
                  "url": data.profile.avatar
                },
                "fields": [
                  {
                    "name": "Rank",
                    "value": data.profile.ranking,
                    "inline": true
                  },
                  {
                    "name": "Rank score",
                    "value": data.profile.rank,
                    "inline": true
                  },
                  {
                    "name": "Tier",
                    "value": data.profile.tier,
                    "inline": true
                  },
                  {
                      "name": "Competitive game played",
                      "value": data.competitive.global.games_played,
                      "inline": true
                  },
                  {
                    "name": "Competitive time played",
                    "value": data.competitive.global.time_played/3600000 + ' hr',
                    "inline": true
                  },
                  {
                    "name": "Competitive game won",
                    "value": data.competitive.global.games_won,
                    "inline": true
                  },
                  {
                    "name": "Competitive game lost",
                    "value": data.competitive.global.games_lost,
                    "inline": true
                  },
                  {
                      "name": "Quickmatch game won",
                      "value": data.quickplay.global.games_won,
                      "inline": true
                  },
                  {
                      "name": "Quickmatch time played",
                      "value": data.quickplay.global.time_played/3600000 + ' hr',
                      "inline": true
                  }
                ]
              };
              message.channel.send({ embed });
        }).catch( err => {
            message.channel.send('No player found')
        })
    }
}

exports.help = {
    name: "!ow find <Skadoosh-12294>",
    value: "Show overall stats of ow player"
};