var safeDrone = require('./util/safe-drone');

safeDrone.connect(onConnect);

/********
* ################ Bad news here... not seeing any GPS position changes if I move the box around...
* ################ Perhaps the distance isn't far enough, or it needs to be flying (probably the latter...)
*/

function onConnect() {
    drone.GPSSettings.resetHome();
    drone.WifiSettings.outdoorSetting(1);

    drone.on("PositionChanged", console.error);
}


// ###### battery event test
// drone.connect(function() {
//     console.log('connected!');
//     drone.on('battery', console.log);
// });

// ###### dumb REPL
// console.log(process.argv[2]);

// drone.connect(function() {
//     console.log('connected!')
//     drone[process.argv[2]]();
// });
