var keypress = require('keypress'),
    safeDrone = require('./util/safe-drone'),
    drone = safeDrone.______REAL_DRONE;

var translate = 0;
    yaw = 0,
    flying = false,
    yawSpeeds = [  -50, -25, -10, -5, 0, 5, 10, 25, 50  ],
    yawSpeedIndex = 4;

safeDrone.connect(function() {

  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin);

    // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    // console.log('got "keypress"', key);
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
    }

    if (key && key.name == 'up') {
      // console.log('up');
      // if (translate == 0) translate = 1;
      // else if (translate == -1) translate = 0;
      // move();

      drone.forward(translateSpeed);

    }
    if (key && key.name == 'down') {
      // console.log('down');
      // if (translate == 0) translate = -1;
      // else if (translate == 1) translate = 0;
      // move();

      drone.backward(translateSpeed);
    }
    if (key && key.name == 'left') {
      // console.log('left');
      // if (yaw == 0) yaw = -1;
      // else if (yaw == 1) yaw = 0;
      // move();

      // drone.clockwise(0);
      // drone.counterClockwise(yawSpeed);
      // setTimeout(function() {
      //     drone.counterClockwise(0);
      //     drone.clockwise(0);
      // }, 500);

      changeYawSpeed(-1);

    }
    if (key && key.name == 'right') {
      // console.log('right');
      // if (yaw == 0) yaw = 1;
      // else if (yaw == -1) yaw = 0;
      // move();

      // drone.counterClockwise(0);
      // drone.clockwise(yawSpeed);
      // setTimeout(function() {
      //     drone.counterClockwise(0);
      //     drone.clockwise(0);
      // }, 500);

      changeYawSpeed(1);
    }

    if (key && key.name == 't') {
      console.log('takeOff');
      drone.takeOff();
    }
    if (key && key.name == 'l') {
      console.log('land');
      drone.land();
    }


    if (key && key.name == 'w') {
      console.log('w');
      drone.up(vertSpeed);
      setTimeout(function() {
          stopEverything();
      }, 750);
    }
    if (key && key.name == 's') {
      console.log('s');
      drone.down(vertSpeed);
      setTimeout(function() {
         stopEverything();
      }, 750);
    }

    if (key && key.name == 'space') {
       console.log('space, stop');
       stopEverything();
    }

  });

    process.stdin.setRawMode(true);
    process.stdin.resume();

});

function stopEverything() {
      console.log('STOPPING EVERYTHING');
      drone.clockwise(0);
      drone.counterClockwise(0);
      drone.up(0);
      drone.down(0);
      drone.stop();  
}

function changeYawSpeed(dir) {
  yawSpeedIndex += dir;
  if (yawSpeedIndex < 0) yawSpeedIndex = 0;
  if (yawSpeedIndex >= yawSpeeds.length) yawSpeedIndex = yawSpeeds.length - 1;
  
  var speed = yawSpeeds[yawSpeedIndex];
  console.log("*** YAW:", speed);

  if (speed < 0) {
    drone.clockwise(0);
    drone.counterClockwise(-speed);
  }
  else {
    drone.counterClockwise(0);
    drone.clockwise(speed);
  }
}

var yawSpeed = 25, translateSpeed = 5, vertSpeed = 15;

// function move() {
//     console.log({translate: translate, yaw: yaw});

//     if (yaw == 0) {
//         drone.clockwise(0);
//     } else if (yaw == 1) {
//         drone.clockwise(yawSpeed);
//     } else if (yaw == -1) {
//         drone.counterClockwise(yawSpeed);
//     }

//     if (translate == 0) {
//         drone.forward(0);
//     } else if (translate == 1) {
//         drone.forward(translateSpeed);
//     } else if (translate == -1) {
//         drone.backward(translateSpeed);
//     }    
// }