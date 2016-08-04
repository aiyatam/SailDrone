'use strict';

var SlackBot = require('slackbots');
var Slack = require('node-slack-upload');
var safeDrone = require('./util/safe-drone');
var keypress = require('keypress');
var exec = require('child_process').exec;
var realDrone = safeDrone.______REAL_DRONE;
// var NodeBebop = require("node-bebop");
// var realDrone = NodeBebop.createClient();
var fs = require('fs');
var path = require('path');

var channelName = 'sail-drone';

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

// Command objects. Modify these if you want to add more commands.
var DRONE_COMMANDS = {
    battery: function() {
        var params = {
            icon_emoji: ':battery:'
        };
        slackBot.postMessageToGroup(channelName, droneState.battery + '%', params);
    },
    // TODO this doesn't work
    // takepicture: function() {
    //     realDrone.takePicture();
    //     slackBot.postMessageToGroup(channelName, 'I just took a picture', params);
    // },
    startrecording: function() {
        realDrone.startRecording();
        slackBot.postMessageToGroup(channelName, 'I started recording...', params);
    },
    stoprecording: function() {
        realDrone.stopRecording();
        slackBot.postMessageToGroup(channelName, 'I stopped recording...', params);
    },
    takeoff: function() {
        realDrone.takeOff(function() {
            slackBot.postMessageToGroup(channelName, 'I am now airborne', params);
        });
    },
    land: function() {
        realDrone.land(function() {
            slackBot.postMessageToGroup(channelName, 'I am on the ground', params);
        });
    },
    stop: function() {
        realDrone.stop();
        slackBot.postMessageToGroup(channelName, 'I am hovering in place', params);
    },
    emergency: function() {
        realDrone.emergency();
        slackBot.postMessageToGroup(channelName, 'Emergency stop executed!', params);
    },
    frontflip: function() {
        realDrone.frontFlip();
        slackBot.postMessageToGroup(channelName, 'I did a front flip', params);
    },
    backflip: function() {
        realDrone.backflip();
        slackBot.postMessageToGroup(channelName, 'I did a back flip', params);
    },
    rightflip: function() {
        realDrone.rightFlip();
        slackBot.postMessageToGroup(channelName, 'I did a right flip', params);
    },
    leftflip: function() {
        realDrone.leftFlip();
        slackBot.postMessageToGroup(channelName, 'I did a left flip', params);
    },
    getvideostream: function() {
        // Test Frigging video
        var output = fs.createWriteStream("./video.h264");
        var video = realDrone.getVideoStream();

        video.pipe(output);

        if (droneState.connected) {
            realDrone.MediaStreaming.videoEnable(1);
            slackBot.postMessageToGroup(channelName, 'video now streaming', params);
        } else {
            realDrone.connect(function() {
                realDrone.MediaStreaming.videoEnable(1);
                slackBot.postMessageToGroup(channelName, 'video now streaming...', params);
            });
        }
    },
    takepicture: function() {
        slackBot.postMessageToGroup(channelName, 'taking picture...', params);
        var child = exec('sh lastframe.sh video.h264', function() {
            OTHER_COMMANDS.uploadapic('video.jpg', 'Sailthru Hackdays', 'wooohoooo!');
        });
    }
};

var OTHER_COMMANDS = {
    hello: function() {
        slackBot.postMessageToGroup(channelName, 'Hey whats up?', params);
    },
    onduty: function() {
        var params = {
            icon_emoji: ':george:'
        };
        slackBot.postMessageToGroup(channelName, ':george:', params);
    },
    george: function() {
        var params = {
            icon_emoji: ':george:'
        };
        slackBot.postMessageToGroup(channelName, 'I :heart: :sail-drone:Saildrone:sail-drone:!!!', params);
    },
    uploadapic: function(fileName, title, comment) {
        var filePath = 'SailDrone/';

        if (fileName && typeof fileName === 'string') {
            filePath += fileName;
        } else {
            filePath += 'drone.jpg';
        }

        slack_upload.uploadFile({
            file: fs.createReadStream(path.join(__dirname, '..', filePath)),
            filename: fileName || 'drone.jpg',
            filetype: 'auto',
            title: title || 'Sail Drone',
            initialComment: comment || 'Wow!',
            channels: channelName
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
        slackBot.postMessageToGroup(channelName, 'current drone state: ' + JSON.stringify(droneState), params);
    }
};

// Initialize
slackBot.on('start', function() {
    console.log('Sailbot Online');
    slackBot.postMessageToGroup(channelName, 'Sailbot Online', params);
    connectToDrone();
    OTHER_COMMANDS.test();
    console.log('Current Drone State: ' + JSON.stringify(droneState));
});

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
                slackBot.postMessageToGroup(channelName, 'I\'m not connected. Cyberdine SkyNet is not alive.', params);
            } else {
                DRONE_COMMANDS[command](additionalOptions);
            }

        } else if (OTHER_COMMANDS.hasOwnProperty(command)) {
            OTHER_COMMANDS[command](additionalOptions);

        } else {
            slackBot.postMessageToGroup(channelName, 'I don\'t understand...', params);
        }
    }
});

function connectToDrone() {
    safeDrone.connect(function () {
        console.log('Connected to drone');
        droneState.connected = true;
        slackBot.postMessageToGroup(channelName, 'Sailbot is now connected to Saildrone!', params);
        initializeController();
        slackBot.postMessageToGroup(channelName, 'Saildrone Controller Initialized!', params);
    });

    safeDrone.on('battery', function(percentage) {
        droneState.battery = percentage;
        slackBot.postMessageToGroup(channelName, 'Battery: ' + percentage, params);
    });
}


// Controller
function initializeController() {
    var translate = 0;
    var yaw = 0;
    var flying = false;
    var yawSpeeds = [  -50, -25, -10, -5, 0, 5, 10, 25, 50  ];
    var yawSpeedIndex = 4;
    var yawSpeed = 25, translateSpeed = 5, vertSpeed = 15;
    var drone = realDrone;

    function stopEverything() {
          console.log('STOPPING EVERYTHING');
          drone.clockwise(0);
          drone.counterClockwise(0);
          drone.up(0);
          drone.down(0);
          drone.stop();
    }

    function changeYawSpeed(dir) {
      yawSpeedIndex += dir;
      if (yawSpeedIndex < 0) yawSpeedIndex = 0;
      if (yawSpeedIndex >= yawSpeeds.length) yawSpeedIndex = yawSpeeds.length - 1;

      var speed = yawSpeeds[yawSpeedIndex];
      console.log("*** YAW:", speed);

      if (speed < 0) {
        drone.clockwise(0);
        drone.counterClockwise(-speed);
      }
      else {
        drone.counterClockwise(0);
        drone.clockwise(speed);
      }
    }

    // make `process.stdin` begin emitting "keypress" events
    keypress(process.stdin);

      // listen for the "keypress" event
    process.stdin.on('keypress', function (ch, key) {
      // console.log('got "keypress"', key);
      if (key && key.ctrl && key.name == 'c') {
        process.stdin.pause();
      }

      if (key && key.name == 'up') {
        // console.log('up');
        // if (translate == 0) translate = 1;
        // else if (translate == -1) translate = 0;
        // move();

        drone.forward(translateSpeed);

      }
      if (key && key.name == 'down') {
        // console.log('down');
        // if (translate == 0) translate = -1;
        // else if (translate == 1) translate = 0;
        // move();

        drone.backward(translateSpeed);
      }
      if (key && key.name == 'left') {
        // console.log('left');
        // if (yaw == 0) yaw = -1;
        // else if (yaw == 1) yaw = 0;
        // move();

        // drone.clockwise(0);
        // drone.counterClockwise(yawSpeed);
        // setTimeout(function() {
        //     drone.counterClockwise(0);
        //     drone.clockwise(0);
        // }, 500);

        changeYawSpeed(-1);

      }
      if (key && key.name == 'right') {
        // console.log('right');
        // if (yaw == 0) yaw = 1;
        // else if (yaw == -1) yaw = 0;
        // move();

        // drone.counterClockwise(0);
        // drone.clockwise(yawSpeed);
        // setTimeout(function() {
        //     drone.counterClockwise(0);
        //     drone.clockwise(0);
        // }, 500);

        changeYawSpeed(1);
      }

      if (key && key.name == 't') {
        console.log('takeOff');
        drone.takeOff();
      }
      if (key && key.name == 'l') {
        console.log('land');
        drone.land();
      }


      if (key && key.name == 'w') {
        console.log('w');
        drone.up(vertSpeed);
        setTimeout(function() {
            stopEverything();
        }, 750);
      }
      if (key && key.name == 's') {
        console.log('s');
        drone.down(vertSpeed);
        setTimeout(function() {
           stopEverything();
        }, 750);
      }

      if (key && key.name == 'space') {
         console.log('space, stop');
         stopEverything();
      }

    });

      process.stdin.setRawMode(true);
      process.stdin.resume();

      console.log('Controller initialized');
}
