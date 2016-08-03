var bebop = require('node-bebop');

var drone = bebop.createClient();


console.log(process.argv[2]);

drone.connect(function() {
    console.log('')
    drone[process.argv[2]]();
});
