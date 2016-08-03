var SlackBot = require('slackbots'),
    Slack = require('node-slack-upload'),
    drone = require('./util/safe-drone'),
    fs = require('fs'),
    path = require('path');

// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};
var slack_upload = new Slack(settings.token);

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

// var path = "/Users/ekot/dev/saildrone/SailDrone/"
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
    if (data.text && data.text.includes('upload saildrone')) {
        slack_upload.uploadFile({
            file: fs.createReadStream(path.join(__dirname, '..', 'SailDrone/drone.jpg')),
            filename: "drone.jpg",
            filetype: 'auto',
            title: 'Sail Drone',
            initialComment: 'Wow!',
            channels: 'sail-drone'
        }, function(err) {
            if (err) {
                console.error(err);
            }
            else {
                console.log('done');
            }
        });

    }
    console.log(data);
});
