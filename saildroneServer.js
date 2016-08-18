var express = require('express'),
    request = require('request'),
    fs = require('fs'),
    zlib = require('zlib'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    concat = require('concat-stream'),

    config = require('./config.js'),
    missionControlSocket,
    slackSocket;

function serve() {

    // ########## Drone Web Socket server logic
    // ##########
    var ioDrone = io.of('/saildrone'), lastData;
    ioDrone.on('connection', function(socket) {
        console.log('Saildrone Server Node new connection! Emitting ping back in 5 secs');
        setTimeout(function() {
            console.log('Saildrone Server Node Emitting ping back');
            socket.emit('ping', { status: "OK" });
        }, 5000);
        
        socket.on('ping', function(data) {
            console.log('Saildrone Server Node received ping message');
            //ioDrone.emit('now What', {});
        });

        // TODO make ROBUST
        // TODO double connects, double sends... oh boy...
        socket.on('mission-control', function(data) {
            console.log('Saildrone Server Node has established COMMS-LINK with Mission Control, Houston we don\'t have a problem yet');
            missionControlSocket = socket;

            socket.on('drone-response', function(data) {
                var pending = pendingRequests[data.uuid];
                if (pending) {
                    res.send(data.text);
                    res.close();
                }
            });
        });

        socket.on('slack', function(data) {
            console.log('Saildrone Server Node has established communicaishe with Slack');
            slackSocket = socket;
        });
    });

    // not worrying about best routing... just need quick stuff
    app.use('/ping', function(req, res) {
        res.send('OK');
    });

    // TODO clean up the init'd code / checks... filters?
    // TODO this is pretty hacky :(
    var pendingRequests = {};
    app.use('/saildrone/:command', function(req, res) {
        if (missionControlSocket) {
            
            // simple back and forth type requests...
            var cmd = req.params.command;
            if (cmd in [ 'battery' ]) {
                var uuid = new Date().getTime(); // TODO: make moar betters
                pendingRequests[uuid] = { req: req, res: res };
                missionControlSocket.send(cmd, {uuid: uuid});
            }
        }
    });


    // ########## copy pasta utility / wiring, just in case, might not be needed
    // ########## 
    var dataPath = config.SAILDRONE_DATA_DIR;
    app.use(express.static('static'));
    app.use('/proxy', function(req, res) {
        var url = req.query.url; //validateProxy(req.query.url);
        if (url) {
            var stream = request({url: url, gzip: true}, function(error, response, body) {
                var data = { url: url, date: new Date(), body: body }
                fs.appendFile(dataPath + "/proxy.access.log", new Date() + "\t" + url + "\n");
                fs.appendFile(dataPath + "/proxy.log", JSON.stringify(data) + "\n");
            });
            req.pipe(stream).pipe(res);
        }
        else res.send("Denied");
    });
    app.get("/proxy-replace", function (req, res) {
        var write = concat(function(response) {
            if (req.query.src && response) {
                response = response.toString().replace(new RegExp(req.query.src, "ig"), req.query.target);
            }
            res.end(response);
        });

        request.get(req.query.url)
            .on('response',
                function (response) {
                    res.writeHead(response.statusCode, response.headers);
                }
            ).pipe(write);
    });

    function die(sig) {
        if (typeof sig === "string") {
            console.log('%s: Saildrone Server Node Received %s - terminating app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Saildrone Server Node server stopped.', Date(Date.now()) );
    }
    process.on('exit', die);
    'hup int quit ill trap abrt bus fpe usr1 segv usr2 term'.split(' ').forEach(function(sig) {
        sig = 'SIG' + sig.toUpperCase();
        process.on(sig, function() { die(sig); });
    });

    var port = config.SAILDRONE_SERVER_PORT,
        ip = config.SAILDRONE_SERVER_ADDRESS;
    http.listen(port, ip, function() {
        console.log('Saildrone Server Node listening on ' + ip + ':' + port);
    });

}

module.exports = {
    serve: serve
}