const {FSWebcam, capture} = require('node-webcam')
const {ARToolkit,ARController} = require('artoolkit5-js')
const path = require('path')
const fs = require('fs')
const Image = require('htmlimage')

var _capture_index = 1

var i = new Image()
i.onload = function() {
  // do something with image.imageData.data (which is a pixel buffer)
 console.log('LOADED')
 ARController.initWithDimensions(1280,768, '/data/camera_para.dat')
}
i.onerror = function(err) {
  // OHNOEZ!
}
i.src = `${__dirname}/cap01.png`

var cam = new FSWebcam({
    device: '/dev/video0',
    output: 'png'
})

// var cam = require('linuxcam')
// cam.start("/dev/video0", 1200, 798)

module.exports = {
    name: 'camera',
    middlewares: [],
    actions: {
        orientation: {
            params: {

            },
            handler(ctx){
                return new this.Promise((resolve,reject)=>{
                    var param = new ARCameraParam();

                    param.onload = function () {
                      var img = document.getElementById('my-image');
                      var ar = new ARController(img.width, img.height, param);
                  
                      // Set pattern detection mode to detect both pattern markers and barcode markers.
                      // This is more error-prone than detecting only pattern markers (default) or only barcode markers.
                      //
                      // For barcode markers, use artoolkit.AR_MATRIX_CODE_DETECTION
                      // For pattern markers, use artoolkit.AR_TEMPLATE_MATCHING_COLOR
                      //
                      ar.setPatternDetectionMode(artoolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX);
                  
                      ar.addEventListener('markerNum', function (ev) {
                        console.log('got markers', markerNum);
                      });
                      ar.addEventListener('getMarker', function (ev) {
                        console.log('found marker?', ev);
                      });
                      ar.loadMarker('Data/patt.hiro', function (marker) {
                        console.log('loaded marker', marker);
                        ar.process(img);
                      });
                  };
                  
                    param.src = 'Data/camera_para.dat';
                })
            }
        },
        list: {
            params: {

            },
            handler(ctx){
                return new this.Promise((resolve,reject)=>{
                    fs.readdir('/sys/class/video4linux/', (err, files) => {
                        if(err){
                            return reject('Unable to scan for v4l2 capture devices: ' + err)
                        }
                        let camera_devices = []
                        files.forEach((deviceName) => {
                            camera_devices.push(deviceName)
                        })
                        resolve(camera_devices)
                    })
                })
                
            }
        },
        capture: {
            params: {

            },
            handler(ctx) {
                return new this.Promise((resolve,reject)=>{
                    cam.capture( `cap${String(_capture_index).padStart(4,'0')}`, function( err, data ) {
                        if(err)
                            return reject(err   )
                        _capture_index++
                        resolve()
                    })
                })
            }
        }
    }
}