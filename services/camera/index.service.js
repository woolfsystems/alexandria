const {FSWebcam, capture} = require('node-webcam')
const fs = require('fs')


fs.readdir('/sys/class/video4linux/', (err, files) => {
    if(err){
        return console.error('Unable to scan for v4l2 capture devices: ' + err)
    }
    let camera_devices = []
    files.forEach((deviceName) => {
        camera_devices.push(deviceName)
    })
    console.log(camera_devices)
})

function cam_capture(device_id){
    var cam = new FSWebcam({
        device: '/dev/video0',
        output: 'png'
    })
    console.log('cam',cam)
    cam.capture( "cap01", function( err, data ) {
        if(!err)
            console.log("captured")
    })
}

var cam = require('linuxcam')
cam.start("/dev/video0", 1200, 798)
var frame = cam.frame()