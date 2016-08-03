var argv = require('minimist')(process.argv.slice(1));

if (argv.dev) {
    console.error('Running in dev mode, starting apps on brocalbrost...');

    var saildroneServer = require('./saildroneServer.js'),
         missionControl = require('./missionControl.js');

    saildroneServer.serve();
    missionControl.run();
    serveLocalSailbot();    
}


// copy pasta ganked from sailbot repo
function serveLocalSailbot() {
    var express = require('express');
    var bodyParser = require('body-parser');
    var logger = require(process.env.HOME + '/dev/sailbot/core/logger');
    var slackHandler = require(process.env.HOME + '/dev/sailbot/core/slackHandler');

    var app = express();
    var port = process.env.PORT || 3000;

    // body parser middleware
    app.use(bodyParser.urlencoded({ extended: true }));

    // test route
    app.get('/', function (req, res) { res.status(200).send('Hey there!') });

    // install handler
    app.post('/slack', slackHandler.handle);

    // error handler
    app.use(function (err, req, res, next) {
      logger.error(err.stack);
      res.status(400).send(err.message);
    });

    app.listen(port, function () {
      logger.info('Sailbot is listening on port ' + port);
    });
}