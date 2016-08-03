var bebop = require('node-bebop');

var drone = bebop.createClient();
console.log("fuck me");

drone.connect(function() {
    console.log("fuck it's working");
    drone.takeOff();

    setTimeout(function() {
        
        drone.frontFlip();

        setTimeout(function(){
            drone.land();
        }, 5000);

    }, 5000);
});
