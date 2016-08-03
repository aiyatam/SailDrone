var bebop = require('node-bebop'),
    realDrone = bebop.createClient(),
    _ = require('lodash')

    client = {},
    fns = 'connect on'.split(' ');

_.each(fns, function(fn) {
    client[fn] = function() {
        return realDrone[fn].apply(realDrone, arguments);
    }
});

module.exports = client;