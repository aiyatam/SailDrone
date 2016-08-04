var SlackBot = require('slackbots'),
    Slack = require('node-slack-upload'),
    // drone = require('./util/safe-drone'),
    NodeBebop = require("node-bebop");
    drone = NodeBebop.createClient(),
    fs = require('fs'),
    path = require('path');

// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};
var slack_upload = new Slack(settings.token);

var params = {
    icon_emoji: ':sail-drone:'
};

var bot = new SlackBot(settings),
    droneState = { connected: false, battery: 100 };

// Initialize
bot.on('start', function() {
    drone.connect(function () {
        console.log('Connected to drone');
        droneState.connected = true;
    });

    drone.on('battery', function(percentage) {
        droneState.battery = percentage;
    });
});

// Command objects. Modify these if you want to add more commands.
var DRONE_COMMANDS = {
    battery: function() {
        var params = {
            icon_emoji: ':battery:'
        };
        bot.postMessageToGroup('sail-drone', droneState.battery + '%', params);
    },
    takepicture: function() {
        drone.takePicture();
        bot.postMessageToGroup('sail-drone', 'I just took a picture', params);
    },
    startrecording: function() {
        drone.startRecording();
        bot.postMessageToGroup('sail-drone', 'I started recording...', params);
    },
    stoprecording: function() {
        drone.stopRecording();
        bot.postMessageToGroup('sail-drone', 'I stopped recording...', params);
    },
    takeoff: function() {
        drone.takeOff(function() {
            bot.postMessageToGroup('sail-drone', 'I am now airborne', params);
        });
    },
    land: function() {
        drone.land(function() {
            bot.postMessageToGroup('sail-drone', 'I am on the ground', params);
        });
    },
    stop: function() {
        drone.stop();
        bot.postMessageToGroup('sail-drone', 'I am hovering in place', params);
    },
    emergency: function() {
        drone.emergency();
        bot.postMessageToGroup('sail-drone', 'Emergency stop executed!', params);
    },
    frontflip: function() {
        drone.frontFlip();
        bot.postMessageToGroup('sail-drone', 'I did a front flip', params);
    },
    backflip: function() {
        drone.backflip();
        bot.postMessageToGroup('sail-drone', 'I did a back flip', params);
    },
    rightflip: function() {
        drone.rightFlip();
        bot.postMessageToGroup('sail-drone', 'I did a right flip', params);
    },
    leftflip: function() {
        drone.leftFlip();
        bot.postMessageToGroup('sail-drone', 'I did a left flip', params);
    }
    // TODO doesn't work
    // headlightson: function() {
    //     NodeBebop.Headlights.intensity(255);
    //     bot.postMessageToGroup('sail-drone', 'Headlights set to 255', params);
    // },
    // headlightsoff: function() {
    //     NodeBebop.Headlights.intensity(0);
    //     bot.postMessageToGroup('sail-drone', 'Headlights set to 0', params);
    // }
};

var OTHER_COMMANDS = {
    hello: function() {
        bot.postMessageToGroup('sail-drone', 'Hey whats up?', params);
    },
    onduty: function() {
        var params = {
            icon_emoji: ':george:'
        };
        bot.postMessageToGroup('sail-drone', ':george:', params);
    },
    george: function() {
        var params = {
            icon_emoji: ':george:'
        };
        bot.postMessageToGroup('sail-drone', 'I :heart: :sail-drone:Saildrone:sail-drone:!!!', params);
    },
    picture: function() {
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
};

// Listen for messages
bot.on('message', function(data) {
    var textArray;
    var command;
    var additionalOptions;

    console.log(data);

    textArray = data.text.split(' ');

    if (typeof textArray !== 'undefined' && textArray.length > 0 && textArray[0] === '@saildrone') {
        command = textArray[1];
        additionalOptions = textArray.slice(2, textArray.length + 1);

        if (DRONE_COMMANDS.hasOwnProperty(command)) {

            if (!droneState.connected) {
                bot.postMessageToGroup('sail-drone', 'I\'m not connected. Cyberdine SkyNet is not alive.', params);
            } else {
                DRONE_COMMANDS[command](additionalOptions);
            }

        } else if (OTHER_COMMANDS.hasOwnProperty(command)) {
            OTHER_COMMANDS[command](additionalOptions);

        } else {
            bot.postMessageToGroup('sail-drone', 'I don\'t understand...', params);
        }
    }
});
