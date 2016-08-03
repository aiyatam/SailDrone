var argv = require('minimist')(process.argv.slice(1));

// this is all kinda barfy

module.exports = {
    SAILDRONE_SERVER_ADDRESS: argv.dev && "127.0.0.1" || process.env.OPENSHIFT_NODEJS_IP || process.env.SAILDRONE_SERVER_ADDRESS,
    SAILDRONE_SERVER_PORT: argv.dev && 30182 || process.env.OPENSHIFT_NODEJS_PORT || process.env.SAILDRONE_SERVER_PORT, // Johnny's bday
    SAILDRONE_DATA_DIR: process.env.OPENSHIFT_DATA_DIR || './data/',


    MISSION_CONTROL_PORT: argv.dev && 81988 || process.env.MISSION_CONTROL_PORT // Andrew's bday
}

module.exports.SAILDRINE_SERVER_URL = "http://" + module.exports.SAILDRONE_SERVER_ADDRESS + ":" + module.exports.SAILDRONE_SERVER_PORT + "/saildrone"