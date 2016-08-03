var drone = require('./util/safe-drone.js'),
    io = require('socket.io-client'),
    config = require('./config.js'),
    saildroneServerSocket,

    droneState = { battery: 100 };

function run() {
    console.log('Mission Control trying to connect to Saildrone Server');
    saildroneServerSocket = io.connect(config.SAILDRINE_SERVER_URL, {reconnect: true});
    saildroneServerSocket.on('connect', function() {
        console.log('Mission Control connected to Saildrone Server, identifying ourself!');
        
        // maybe not the best way to do this...?
        saildroneServerSocket.emit('mission-control', {});
    });
    saildroneServerSocket.on('ping', function() {
        console.log('Mission Control received ping back');
    });

    console.log('Mission Control trying to connect to BEBOP sans Rocksteady');
    drone.connect(function() {
        console.log('Mission Control CONNECTED to BEBOP sans Rocksteady');

        drone.on('battery', function(percentage) {
            droneState.battery = percentage;
        });
    });

    saildroneServerSocket.on('battery', function(msg) {
        console.log('Mission control was asked for battery');
        saildroneServerSocket.emit('drone-response', {uuid: msg.uuid, text: droneState.battery});
    });
}

module.exports = {
    run: run
}