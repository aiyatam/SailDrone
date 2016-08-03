var _ = require('lodash'),
    io = require('socket.io-client'),
    argv = require('minimist')(process.argv.slice(2)),
    url = 'http://' + (argv.host || '127.0.0.1') + ':' + (argv.port || 30182) + (argv.uri || '/saildrone'),
    socket = io.connect(url, {reconnect: true});

if (argv.rec) {
    console.log('Will listen for event back', argv.rec)
    setTimeout(function() { }, 99999999); // don't exit yo
    socket.on(argv.rec, function() {
        console.log('Got', argv.rec, 'back!', arguments);
    });
}

socket.on('connect', function () {
    console.log('Connected!');
    
    var js = argv._[1];
    if (js) {
        js = eval('(' + js + ')');
        var event = argv._[0];
        console.log('emitting', event, JSON.stringify(js), 'to', url);
        socket.emit(event, js);
    }

    if (!argv.rec) {
        socket.close();
    }
});