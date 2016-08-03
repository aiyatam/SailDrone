"use strict";

var bebop = require("node-bebop"),
    fs = require("fs");

var output = fs.createWriteStream("./video.h264"),
    drone = bebop.createClient(),
    video = drone.getVideoStream();

video.pipe(output);

drone.connect(function() {
  drone.MediaStreaming.videoEnable(1);
});