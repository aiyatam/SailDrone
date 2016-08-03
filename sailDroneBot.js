var SlackBot = require('slackbots');

// create a Bot
var settings = {
    // token: 'xoxb-65991074277-cpD1VAjrJan9J8UBCOOLGNIj',
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'saildrone'
};

var bot = new SlackBot(settings);

bot.on('start', function() {
    // bot.postMessageToChannel('some-channel-name', 'Hello channel!');
    // bot.postMessageToUser('some-username', 'yo bro!');
    // bot.postMessageToGroup('saildrone', 'yo whats good?');

    var params = {
        icon_emoji: ':battery:'
    };

    // bot.postMessageToChannel('general', 'test!', params);
    bot.postMessageToGroup('sail-drone', 'How may I be of service?', params);
});
