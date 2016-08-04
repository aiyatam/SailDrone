'use strict';

var SlackBot = require('slackbots');
var Slack = require('node-slack-upload');
var drone = require('./util/safe-drone');
// var NodeBebop = require("node-bebop");
// var drone = NodeBebop.createClient();
var fs = require('fs');
var path = require('path');

// create a Bot
var settings = {
    token: process.env.HACK_BOT_API_TOKEN,
    name: 'sail-drone'
};
var slack_upload = new Slack(settings.token);

var params = {
    icon_emoji: ':sail-drone:'
};

var slackBot = new SlackBot(settings);
var droneState = { connected: false, battery: undefined };

function connectToDrone() {
    drone.connect(function () {
        console.log('Connected to drone');
        droneState.connected = true;
        slackBot.postMessageToGroup('sail-drone', 'Sailbot is now connected to Saildrone!', params);
    });

    drone.on('battery', function(percentage) {
        droneState.battery = percentage;
        slackBot.postMessageToGroup('sail-drone', 'Battery: ' + percentage, params);
    });
}

// Initialize
slackBot.on('start', function() {
    console.log('Sailbot Online');
    slackBot.postMessageToGroup('sail-drone', 'Sailbot Online', params);
    connectToDrone();
    OTHER_COMMANDS.test();
    console.log('Current Drone State: ' + JSON.stringify(droneState));
});

// Command objects. Modify these if you want to add more commands.
var DRONE_COMMANDS = {
    battery: function() {
        var params = {
            icon_emoji: ':battery:'
        };
        slackBot.postMessageToGroup('sail-drone', droneState.battery + '%', params);
    },
    takepicture: function() {
        drone.takePicture();
        slackBot.postMessageToGroup('sail-drone', 'I just took a picture', params);
    },
    startrecording: function() {
        drone.startRecording();
        slackBot.postMessageToGroup('sail-drone', 'I started recording...', params);
    },
    stoprecording: function() {
        drone.stopRecording();
        slackBot.postMessageToGroup('sail-drone', 'I stopped recording...', params);
    },
    takeoff: function() {
        drone.takeOff(function() {
            slackBot.postMessageToGroup('sail-drone', 'I am now airborne', params);
        });
    },
    land: function() {
        drone.land(function() {
            slackBot.postMessageToGroup('sail-drone', 'I am on the ground', params);
        });
    },
    stop: function() {
        drone.stop();
        slackBot.postMessageToGroup('sail-drone', 'I am hovering in place', params);
    },
    emergency: function() {
        drone.emergency();
        slackBot.postMessageToGroup('sail-drone', 'Emergency stop executed!', params);
    },
    frontflip: function() {
        drone.frontFlip();
        slackBot.postMessageToGroup('sail-drone', 'I did a front flip', params);
    },
    backflip: function() {
        drone.backflip();
        slackBot.postMessageToGroup('sail-drone', 'I did a back flip', params);
    },
    rightflip: function() {
        drone.rightFlip();
        slackBot.postMessageToGroup('sail-drone', 'I did a right flip', params);
    },
    leftflip: function() {
        drone.leftFlip();
        slackBot.postMessageToGroup('sail-drone', 'I did a left flip', params);
    },
    getvideostream: function() {
        // Test Frigging video
        var output = fs.createWriteStream("./video.h264");
        var video = drone.getVideoStream();

        video.pipe(output);

        if (droneState.connected) {
            drone.MediaStreaming.videoEnable(1);
            slackBot.postMessageToGroup('sail-drone', 'video now streaming', params);
        } else {
            drone.connect(function() {
                drone.MediaStreaming.videoEnable(1);
                slackBot.postMessageToGroup('sail-drone', 'video now streaming...', params);
            });
        }
    }
};

var OTHER_COMMANDS = {
    hello: function() {
        slackBot.postMessageToGroup('sail-drone', 'Hey whats up?', params);
    },
    onduty: function() {
        var params = {
            icon_emoji: ':george:'
        };
        slackBot.postMessageToGroup('sail-drone', ':george:', params);
    },
    george: function() {
        var params = {
            icon_emoji: ':george:'
        };
        slackBot.postMessageToGroup('sail-drone', 'I :heart: :sail-drone:Saildrone:sail-drone:!!!', params);
    },
    uploadapic: function() {
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
    },
    test: function() {
        slackBot.postMessageToGroup('sail-drone', 'current drone state: ' + JSON.stringify(droneState), params);
    }
};

// Listen for messages
slackBot.on('message', function(data) {
    var textArray;
    var command;
    var additionalOptions;

    // console.log(data);
    if (!data.text) {
        return;
    }

    textArray = data.text.split(' ');

    if (typeof textArray !== 'undefined' && textArray.length > 0 && textArray[0] === '@saildrone') {
        command = textArray[1];
        additionalOptions = textArray.slice(2, textArray.length + 1);

        if (DRONE_COMMANDS.hasOwnProperty(command)) {

            if (!droneState.connected) {
                slackBot.postMessageToGroup('sail-drone', 'I\'m not connected. Cyberdine SkyNet is not alive.', params);
            } else {
                DRONE_COMMANDS[command](additionalOptions);
            }

        } else if (OTHER_COMMANDS.hasOwnProperty(command)) {
            OTHER_COMMANDS[command](additionalOptions);

        } else {
            slackBot.postMessageToGroup('sail-drone', 'I don\'t understand...', params);
        }
    }
});
