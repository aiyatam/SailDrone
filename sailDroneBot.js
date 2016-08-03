var SlackBot = require('slackbots');
var Slack = require('node-slack-upload')

var fs = require('fs');
var path = require('path');



// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};
var slack_upload = new Slack(settings.token);

var params = {
    icon_emoji: ':battery:'
};

var bot = new SlackBot(settings);

bot.on('start', function() {
    // bot.postMessageToChannel('some-channel-name', 'Hello channel!');
    // bot.postMessageToUser('some-username', 'yo bro!');
    // bot.postMessageToGroup('saildrone', 'yo whats good?');

    // bot.postMessageToChannel('general', 'test!', params);
    // bot.postMessageToGroup('sail-drone', 'testing...', params);
});

// var path = "/Users/ekot/dev/saildrone/SailDrone/"
bot.on('message', function(data) {
    if (data.text && data.text.includes('hello')) {
        bot.postMessageToGroup('sail-drone', 'hey hows it going?', params);
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
