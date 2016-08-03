var SlackBot = require('slackbots');

// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};

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

bot.on('message', function(data) {
    if (data.text && data.text.includes('hello')) {
        bot.postMessageToGroup('sail-drone', 'hey hows it going?', params);
    }
    console.log(data);
});
