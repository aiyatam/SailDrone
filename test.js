var drone = require('./util/safe-drone');


drone.connect(function() {
    console.log('connected!')
    drone.on('battery', console.log);
});

// console.log(process.argv[2]);

// drone.connect(function() {
//     console.log('connected!')
//     drone[process.argv[2]]();
// });
