const {FSWebcam} = require('node-webcam')

var cam = new FSWebcam({
    device: '/dev/video0',
    output: 'png'
})
console.log('cam',cam)
cam.capture( "cap01", function( err, data ) {
    if(!err)
        console.log("captured")
})