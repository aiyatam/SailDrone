var SlackBot = require('slackbots'),
    drone = require('./util/safe-drone');

// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};

var params = {
    icon_emoji: ':battery:'
};

var bot = new SlackBot(settings),
    droneState = { connected: false, battery: 100 };

bot.on('start', function() {
    drone.connect(function () {
        console.log('Connected to drone');
        droneState.connected = true;
    });

    drone.on('battery', function(percentage) {
        droneState.battery = percentage;
    });
});

bot.on('message', function(data) {
    var text = data.text;
    if (text && text.includes('@saildrone')) {
        if (!droneState.connected) {
            bot.postMessageToGroup('sail-drone', 'I\'m not connected, Cyberdine SkyNet is not alive', params);
        }

        else {
            if (text.includes('battery')) {
                bot.postMessageToGroup('sail-drone', droneState.battery + '%', params);
            }
            else {
                bot.postMessageToGroup('sail-drone', 'I don\'t understand', params);
            }
        }
    }
    console.log(data);
});
