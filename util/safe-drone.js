var bebop = require('node-bebop'),
    realDrone = bebop.createClient(),
    _ = require('lodash'),

    allowedFns = 'on getPngStream'.split(' '),
    allowedObjects = 'GPSSettings WifiSettings'.split(' ');

var client = {
    connect: function(callback) {
        realDrone.connect(function() {
            console.error('Node lib connected to DRONE!\n')
            console.error('Dumping real drone methods:\n********* (HOW TF is e.g. "takeOff" missing????)\n');
            console.error(_.keys(realDrone).join(', '), '\n');
            realDrone.on('battery', _.bind(console.error, console, 'Battery:', _, '%'));
        });
    }
}

// add allowed, delegated methods
_.each(allowedFns, function(fn) {
    client[fn] = function() {
        return realDrone[fn].apply(realDrone, arguments);
    }
});

// add allowed settings / objects
_.each(allowedObjects, function(v, objectName) {
    client[objectName] = realDrone[objectName];
});

module.exports = client;